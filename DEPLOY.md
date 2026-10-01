# Despliegue en producción

Guía para instalar y correr JisaMaintenance en el servidor interno de la
empresa (Windows), de forma que quede accesible desde la red local (LAN) y
por VPN, con varios usuarios trabajando al mismo tiempo.

## 1. Arquitectura

| Servicio            | Tipo                | Puerto | Escucha en       | Rol                                               |
| ------------------- | ------------------- | ------ | ---------------- | ------------------------------------------------- |
| `web-app` (IIS)     | Frontend (estático) | 8095   | toda la red      | Build de producción (`dist`) publicado en IIS     |
| `web-app` (Vite)    | Frontend (dev)      | 3333   | `127.0.0.1`      | Servidor de desarrollo (`vite.config.ts`)         |
| `api-gateway`       | HTTP                | 3000   | toda la red      | Único punto de entrada HTTP del frontend          |
| `auth-service`      | TCP (microservicio) | 3001   | `127.0.0.1`      | Login / JWT                                       |
| `users-service`     | TCP (microservicio) | 3002   | `127.0.0.1`      | Usuarios                                          |
| `inventary-service` | TCP (microservicio) | 3003   | `127.0.0.1`      | Inventario, compras, salidas, repuestos           |
| `ot-service`        | TCP (microservicio) | 3004   | `127.0.0.1`      | Órdenes de trabajo, informes, programación de OTs |
| MySQL (Docker)      | Base de datos       | 3010   | → 3306 container | Base `core_db`, compartida por los microservicios |

Flujo de una petición (ej. login):

```
Navegador ──HTTP──▶ IIS :8095 (archivos de dist/)
Navegador ──HTTP──▶ api-gateway :3000 ──TCP──▶ auth-service 127.0.0.1:3001 ──▶ MySQL 127.0.0.1:3010
```

El frontend solo habla HTTP con el `api-gateway` (nunca directo con los
microservicios). El gateway reenvía cada request al microservicio
correspondiente por TCP interno.

Existe además un contenedor `BI` (puerto `3020`, base `bi_db`) que hoy no
usa ninguna parte del sistema; se puede ignorar o apagar sin impacto.

### Por qué IPv4 (`127.0.0.1`) y no `localhost`

En Windows con Node ≥17, `localhost` se resuelve primero a IPv6 (`::1`). Un
microservicio configurado con `localhost` quedaba escuchando solo en
`[::1]:3001`, el gateway intentaba conectarse por IPv4 y el login quedaba
en **"Pending"**. Por eso microservicios, clientes del gateway y conexión a
MySQL usan `127.0.0.1`; si algún `.env` todavía dice `localhost`, el código
lo traduce a `127.0.0.1` automáticamente.

## 2. Requisitos del servidor

- **Node.js 22 LTS** (≥22.14) y **pnpm 10.8+** (`corepack enable` o
  `npm i -g pnpm`). No usar Node 26: una dependencia de JWT
  (`buffer-equal-constant-time`) falla al arrancar el `auth-service`.
- **Docker Desktop** para MySQL (o un MySQL 8 instalado, ajustando
  `DB_HOST`/`DB_PORT`).
- **IIS** con el módulo **URL Rewrite** instalado, para publicar el frontend.
- **IP fija** (o reserva DHCP) para el servidor dentro de la red; en el
  servidor de la empresa es `192.168.5.5`. Ver sección 7.

## 3. Primera instalación

```powershell
git clone <repo> JisaMaintenance-PG
cd JisaMaintenance-PG
pnpm install
```

Levantar la base de datos (con Docker Desktop iniciado):

```powershell
cd infrastructure
docker compose up -d
docker ps   # debe mostrar MYSQL como "Up" con 0.0.0.0:3010->3306/tcp
```

## 4. Variables de entorno

Cada servicio trae un `.env.example` documentando sus variables. Copiarlo a
`.env` en cada carpeta:

```powershell
Copy-Item app\auth-service\.env.example      app\auth-service\.env
Copy-Item app\users-service\.env.example     app\users-service\.env
Copy-Item app\inventary-service\.env.example app\inventary-service\.env
Copy-Item app\ot-service\.env.example        app\ot-service\.env
Copy-Item app\api-gateway\.env.example       app\api-gateway\.env
```

Con la base de datos por defecto del `docker-compose.yml`, los
microservicios funcionan **sin tocar nada**: los valores por defecto ya
apuntan a `127.0.0.1:3010` / `core_db`.

### Lo que hay que configurar

**`CORS_ORIGINS`** en `app\api-gateway\.env`: todas las direcciones desde las
que se abre el frontend (protocolo + host + puerto exactos). Para el
servidor de la empresa:

```ini
CORS_ORIGINS=http://localhost:3333,http://192.168.5.5:3333,http://localhost:8095,http://192.168.5.5:8095
```

Sin esto el navegador bloquea por CORS cualquier acceso que no venga del
propio servidor (sin la variable solo se aceptan `localhost`/`127.0.0.1`
en los puertos 3333 y 8095). Si se publica con un dominio, agregarlo también
(ej. `https://mantenimiento.dominio.com`).

**`JWT_SECRET`** en `app\auth-service\.env`: cambiar `your-secret-key` por un
valor largo y privado.

### Variables opcionales

- `MICROSERVICE_TIMEOUT_MS` (gateway, por defecto `15000`): tiempo máximo
  que el gateway espera a un microservicio antes de responder **504**.
- `*_SERVICE_HOST` / `*_SERVICE_PORT` (gateway) y `SERVICE_HOST` /
  `SERVICE_PORT` (microservicios): solo si algún día se separan los
  servicios en máquinas distintas (en ese caso, `SERVICE_HOST=0.0.0.0` en el
  microservicio para aceptar conexiones de otra máquina).

### El frontend no necesita `.env`

`app/web-app` calcula sola la URL del gateway a partir de la dirección con la
que el usuario abrió el sitio: desde `http://192.168.5.5:8095` llama a
`http://192.168.5.5:3000`; desde `http://localhost:3333`, a
`http://localhost:3000`. El mismo build sirve sin recompilar, entre por
`localhost`, por la IP de la LAN o por VPN. Solo haría falta
`VITE_API_URL` (en `app/web-app/.env`, antes del build) si el gateway se
publicara en otra dirección, por ejemplo detrás de IIS en `/api`.

## 5. Frontend en desarrollo (Vite, puerto 3333)

`app/web-app/vite.config.ts` fija el servidor de desarrollo en
`127.0.0.1:3333`:

```ts
server: {
  host: '127.0.0.1',
  port: 3333,
},
```

```powershell
pnpm dev:app          # solo el frontend
pnpm dev              # todos los servicios en modo desarrollo
```

- Con `host: '127.0.0.1'` el servidor de desarrollo **solo se abre desde el
  propio servidor** (`http://localhost:3333`). Para que lo usen otras PCs
  habría que cambiarlo a `host: '0.0.0.0'`; en producción no hace falta,
  porque los usuarios entran por IIS (8095).
- Si el puerto 3333 está ocupado, Vite arranca en otro puerto (lo indica en
  la consola). Para que falle en vez de cambiar de puerto, agregar
  `strictPort: true` en `server`.
- Esta configuración **no afecta al build**: lo que publica IIS es `dist/`.

## 6. Build y ejecución en producción

Compilar todo (los 5 backends a `dist/`, el frontend a `app/web-app/dist/`):

```powershell
pnpm build
```

### 6.1 Backend con pm2

Para que los servicios sigan corriendo al cerrar la sesión RDP y se
reinicien solos si fallan o si el servidor reinicia, usar
[pm2](https://pm2.keymetrics.io/):

```powershell
npm install -g pm2

pm2 start app/auth-service/dist/main.js       --name auth-service
pm2 start app/users-service/dist/main.js      --name users-service
pm2 start app/inventary-service/dist/main.js  --name inventary-service
pm2 start app/ot-service/dist/main.js         --name ot-service
pm2 start app/api-gateway/dist/main.js        --name api-gateway

pm2 save
```

En Windows, `pm2 startup` no funciona: para que arranque solo al iniciar el
servidor usar [`pm2-installer`](https://github.com/jessety/pm2-installer)
(lo instala como servicio de Windows). Alternativa sin pm2, solo para
pruebas: `pnpm start:prod` (corre los 5 backends en la terminal actual).

### 6.2 Frontend en IIS (puerto 8095)

1. **Ruta física** del sitio: `<repo>\app\web-app\dist`.
2. **Enlace (binding)**: `http`, IP "Todas las no asignadas", puerto
   **8095**, nombre de host vacío. (8092 es del Sistema de Inocuidad y 8093
   ya está asignado a otro sitio.)
3. **URL Rewrite**: el build ya incluye `dist\web.config` (viene de
   `app/web-app/public/web.config`) con la regla de SPA: las rutas del
   frontend (`/login`, `/home`, `/ot`…) devuelven `index.html` y los
   archivos reales (`assets/…`) se sirven tal cual. No hay que crearlo a mano
   después de cada build.
4. **Borrar o desactivar** cualquier regla de *Reverse Proxy* anterior que
   mande el tráfico a `http://localhost:3333`: con la publicación estática
   IIS sirve directamente `dist`, sin pasar por Vite.
5. Agregar `http://localhost:8095` y `http://192.168.5.5:8095` a
   `CORS_ORIGINS` (sección 4) y reiniciar el gateway (`pm2 restart
   api-gateway`).

Alternativas a IIS: `pm2 serve app/web-app/dist 8095 --name web-app --spa`,
o nginx apuntando a `dist` con `try_files $uri /index.html;`.

## 7. Red: IP fija, puertos y firewall

El servidor necesita una **IP fija** dentro de la LAN (o una reserva DHCP en
el router). Si cambia, deja de coincidir con `CORS_ORIGINS`.

Puertos que deben estar abiertos en el firewall de Windows hacia la LAN (y,
si aplica, hacia el rango de IPs de la VPN):

- `8095` — frontend publicado en IIS
- `3000` — api-gateway (el navegador de cada usuario lo llama directamente)

Tráfico **interno** del servidor, que no hay que abrir (y por seguridad
conviene no hacerlo):

- `3333` — Vite en desarrollo (de todos modos escucha solo en `127.0.0.1`)
- `3001`–`3004` — microservicios (escuchan solo en `127.0.0.1`)
- `3010` / `3020` — MySQL

## 8. Verificación

En el servidor (PowerShell):

```powershell
docker ps                                   # MYSQL "Up"
netstat -ano | findstr ":3000 :3001 :3002 :3003 :3004"
```

Debe verse `0.0.0.0:3000` (gateway) y `127.0.0.1:3001` … `127.0.0.1:3004`
en estado `LISTENING`. Si algún microservicio aparece solo en `[::1]`, está
corriendo una versión anterior del código (ver sección 9).

Probar el login contra el gateway (debe responder en menos de un segundo):

```powershell
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:3000/auth/login `
  -ContentType 'application/json' `
  -Body '{"userName":"admin","password":"<contraseña>"}'
```

- Credenciales correctas → devuelve `access_token` y `user`.
- Contraseña incorrecta → **401** "Contraseña incorrecta".
- Microservicio caído → **503** "Servicio no disponible…" (inmediato).
- Microservicio que no responde → **504** a los 15 s. En ningún caso la
  petición debería quedar "Pending".

Luego, desde otra PC de la red, abrir `http://192.168.5.5:8095`, iniciar
sesión con dos usuarios distintos en dos equipos y confirmar que lo que
registra uno (una OT, un informe) lo ve el otro al refrescar.

## 9. Actualizar a una nueva versión

```powershell
git pull
pnpm install
pnpm build
pm2 restart all
```

IIS no necesita cambios: sigue apuntando a `app\web-app\dist`, que el build
regenera (con su `web.config`). Si el navegador muestra la versión anterior,
recargar con Ctrl+F5.

## 10. Troubleshooting

**El login queda "Pending"** — el gateway no logra hablar con el
`auth-service`. Revisar con `netstat` que el auth-service esté en
`127.0.0.1:3001` (sección 8). Si aparece en `[::1]:3001`, el código del
servidor es anterior a la corrección de IPv4: actualizar (sección 9). Con la
versión actual, en vez de "Pending" el gateway responde 503/504.

**503 "Servicio no disponible"** — algún microservicio no está levantado:
`pm2 status` y `pm2 logs <servicio>`. Suele ser MySQL caído (Docker Desktop
cerrado tras un reinicio del servidor) o un error al arrancar.

**504 "El servicio no respondió a tiempo"** — el microservicio está levantado
pero no contesta; revisar `pm2 logs <servicio>` (típicamente la conexión a
MySQL).

**"Failed to fetch" / "CORS header 'Access-Control-Allow-Origin' missing"
en la consola del navegador** — el origen desde el que se abrió el frontend
(lo que aparece en la barra de direcciones: protocolo + IP + puerto, ej.
`http://192.168.5.5:8095`) no está en `CORS_ORIGINS` del gateway. Al
arrancar, el gateway muestra en su log la lista que tomó:

```powershell
pm2 logs api-gateway --lines 50   # buscar "CORS: orígenes permitidos -> ..."
```

Si el origen no aparece, agregarlo en `app\api-gateway\.env` (protocolo +
host + puerto exactos, separados por coma) y `pm2 restart api-gateway`. Cada
servicio lee siempre el `.env` de su propia carpeta, sin importar desde dónde
se lance.

**404 de IIS al refrescar una página interna (ej. `/home`)** — falta el
módulo URL Rewrite o el `web.config` en `dist`. Volver a hacer `pnpm build`
(lo copia desde `public/`) y confirmar que URL Rewrite está instalado.

**El `auth-service` no arranca con `TypeError: Cannot read properties of
undefined (reading 'prototype')`** — se está usando Node 26. Usar Node 22 LTS.

**Los microservicios no arrancan / error de conexión a MySQL** — confirmar
que Docker Desktop está iniciado y `docker ps` muestra `MYSQL` como `Up`, y
que `DB_HOST`/`DB_PORT` de los `.env` apuntan a `127.0.0.1:3010`.

**Un usuario no ve el menú correcto** — los permisos por rol se aplican en
la interfaz (qué menús y rutas ve cada rol). El cambio de contraseña sí está
protegido también en el backend (solo administrador, con el token de
sesión); el resto de la API no tiene una segunda capa de autorización. Es una
limitación conocida, no un problema de la instalación.

**Un microservicio no arranca con un `QueryFailedError` sobre un
índice/columna al hacer `DROP`/`ALTER`** — `ot-service` e
`inventary-service` declaran copias separadas de las entidades `Process`,
`Maquina` y `SubUnidad` (apuntan a las mismas tablas de `core_db`, cada una
con `synchronize: true`). Si se agrega una columna o índice a una de esas
entidades en un servicio, hay que replicar el cambio en la copia del otro;
si no, el que arranque después intenta "corregir" lo que no reconoce y puede
fallar al iniciar (o borrar una columna que el otro servicio necesita). Lo
mismo aplica a cualquier entidad compartida entre servicios, como `User`
(definida en auth, users y ot).

## 11. Limitaciones conocidas

- **Bundle del frontend grande (~1.5 MB sin comprimir, ~390 KB gzip)**: Vite
  lo avisa en el build. No afecta el funcionamiento, pero en una red lenta la
  primera carga puede tardar. Se podría mejorar con code-splitting
  (`React.lazy` por módulo) si llegara a molestar.

**Corregido**: los correlativos de máquinas, procesos y subunidades
(`inventary-service/src/{maquina,process,subUnidad}/*.service.ts`) se
calculan dentro de una transacción con `SELECT ... FOR UPDATE`, que serializa
las creaciones concurrentes sobre el mismo proceso/centro de costo/máquina.
Como respaldo para el caso en que no hay ninguna fila previa que bloquear
(la primera máquina de un proceso, por ejemplo), cada entidad tiene un índice
único sobre `(padre, correlativo)`; si ese caso llegara a chocar, el servicio
reintenta una vez automáticamente (`common/concurrency.util.ts`). Verificado
con 6 creaciones simultáneas contra el mismo proceso: los 6 correlativos
salieron únicos y consecutivos.
