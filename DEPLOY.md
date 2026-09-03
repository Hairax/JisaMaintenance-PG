# Despliegue en producción

Guía para instalar y correr JisaMaintenance en el servidor interno de la
empresa, de forma que quede accesible tanto desde la red local (LAN) como
por conexión remota (VPN) a esa misma red, y soportando múltiples usuarios
trabajando al mismo tiempo.

## 1. Arquitectura

El sistema son 6 procesos Node independientes:

| Servicio          | Tipo               | Puerto por defecto | Rol                                             |
| ------------------ | ------------------ | ------------------- | ------------------------------------------------ |
| `web-app`           | Frontend (estático) | 5173                 | UI en React, servida como archivos estáticos     |
| `api-gateway`       | HTTP                | 3000                 | Único punto de entrada HTTP del frontend          |
| `auth-service`      | TCP (microservicio) | 3001                 | Login / JWT                                       |
| `users-service`     | TCP (microservicio) | 3002                 | Usuarios                                          |
| `inventary-service` | TCP (microservicio) | 3003                 | Inventario, compras, salidas, repuestos           |
| `ot-service`        | TCP (microservicio) | 3004                 | Órdenes de trabajo, informes, programación de OTs |

El frontend solo habla HTTP con `api-gateway` (nunca directo con los
microservicios). `api-gateway` reenvía cada request al microservicio
correspondiente por TCP interno.

Base de datos: MySQL corriendo en Docker (`infrastructure/docker-compose.yml`),
puerto `3010`, base `core_db`, compartida por los 4 microservicios. Existe
además un contenedor `BI` (puerto `3020`, base `bi_db`) que hoy no está en
uso por ninguna parte del sistema — se puede ignorar o apagar sin impacto.

## 2. Requisitos del servidor

- Node.js 22.14+ y pnpm 10.8+ (`corepack enable` o `npm i -g pnpm`)
- Docker (para MySQL) — o un MySQL 8 ya instalado, ajustando `DB_HOST`/`DB_PORT`
- Una IP fija (o reservada por DHCP) para esta máquina dentro de la red de
  la empresa — ver sección 6

## 3. Primera instalación

```bash
git clone <repo> jisa-maintenance
cd jisa-maintenance
pnpm install
```

Levantar la base de datos:

```bash
cd infrastructure
docker compose up -d
```

## 4. Variables de entorno

Cada servicio trae un `.env.example` documentando sus variables. Copiarlo a
`.env` en cada carpeta y ajustar lo necesario:

```bash
cp app/auth-service/.env.example app/auth-service/.env
cp app/users-service/.env.example app/users-service/.env
cp app/inventary-service/.env.example app/inventary-service/.env
cp app/ot-service/.env.example app/ot-service/.env
cp app/api-gateway/.env.example app/api-gateway/.env
cp app/web-app/.env.example app/web-app/.env
```

Con la base de datos por defecto del `docker-compose.yml`, los 4
microservicios funcionan **sin tocar nada** (los `.env` son opcionales, los
valores por defecto ya apuntan a `localhost:3010` / `core_db`).

Lo único que **hay que configurar en producción** es `CORS_ORIGINS` en
`app/api-gateway/.env`, con la dirección real donde va a vivir el frontend:

```bash
# app/api-gateway/.env
CORS_ORIGINS=http://<IP-DEL-SERVIDOR>:5173
```

Esta es la variable que causaba que el sistema solo funcionara en la PC que
lo corría: sin ella, el navegador bloquea por CORS cualquier request que no
venga de `localhost:5173`. Con la IP real del servidor acá, tanto un cliente
en la LAN como uno conectado por VPN pueden usar el sistema, porque ambos
llegan al mismo origen.

El frontend (`app/web-app`) **no necesita ningún `.env`**: en tiempo de
ejecución calcula sola la URL del `api-gateway` a partir del host con el que
el usuario entró al sitio (`window.location.hostname`), así que el mismo
build funciona sin recompilar sea que se acceda por `localhost`, por la IP
de LAN, o por la dirección que resuelva la VPN. Solo hace falta un `.env` ahí
si el `api-gateway` corriera en un host o puerto distinto al del frontend
(por ejemplo, detrás de un proxy reverso) — ver `app/web-app/.env.example`.

## 5. Build y ejecución en producción

Compilar todo (los 5 backends a `dist/`, el frontend a `app/web-app/dist/`):

```bash
pnpm build
```

Levantar los 5 servicios backend en modo producción (usa el JS ya compilado,
no `ts-node`, y no observa cambios de archivos):

```bash
pnpm start:prod
```

Esto corre los 5 procesos en paralelo en la terminal actual. Para que sigan
corriendo tras cerrar la sesión SSH/RDP y se reinicien solos si crashean o si
el servidor reinicia, usar un gestor de procesos — recomendado
[pm2](https://pm2.keymetrics.io/):

```bash
npm install -g pm2

pm2 start app/auth-service/dist/main.js       --name auth-service
pm2 start app/users-service/dist/main.js      --name users-service
pm2 start app/inventary-service/dist/main.js  --name inventary-service
pm2 start app/ot-service/dist/main.js         --name ot-service
pm2 start app/api-gateway/dist/main.js        --name api-gateway

pm2 save
pm2 startup   # imprime el comando para que pm2 arranque solo al bootear el server
```

El frontend es un sitio estático (`app/web-app/dist/`) — cualquier servidor
de archivos estáticos sirve. La opción más simple sin instalar nada extra:

```bash
pm2 serve app/web-app/dist 5173 --name web-app --spa
```

(`--spa` es necesario: sin eso, refrescar una ruta interna como `/dashboard`
directamente en el navegador da 404, porque el archivo físico no existe —
todas las rutas deben resolver a `index.html` y dejar que React Router las
maneje del lado del cliente.)

Alternativa si el servidor ya tiene nginx: apuntar un `server` block a
`app/web-app/dist` con `try_files $uri /index.html;` y proxy-pasar `/api` (o
lo que corresponda) hacia `http://localhost:3000` si se prefiere no exponer
el puerto del gateway directamente.

## 6. Red: IP fija y puertos

Para que la URL no cambie cada vez que el router reasigna DHCP, la máquina
servidor necesita una **IP fija dentro de la LAN** (o una reserva DHCP en el
router, que es lo mismo en la práctica). Sin esto, cada reinicio del switch/
router puede darle una IP distinta al servidor y el frontend construido con
esa IP en `CORS_ORIGINS` dejaría de funcionar hasta reconfigurar.

Puertos que deben quedar accesibles desde donde se conecten los usuarios
(LAN y, si aplica, el rango de IPs que asigna la VPN):

- `5173` — frontend
- `3000` — api-gateway

Los puertos `3001`-`3004` (microservicios) y `3010`/`3020` (MySQL) son
tráfico **interno** del servidor — no hace falta abrirlos hacia la LAN ni la
VPN, y por seguridad es mejor no hacerlo.

## 7. Verificar que el multiusuario funciona

1. Confirmar que `CORS_ORIGINS` en `app/api-gateway/.env` tiene la IP fija
   del servidor (no `localhost`).
2. Desde dos máquinas distintas de la LAN (o una LAN y una por VPN), abrir
   `http://<IP-DEL-SERVIDOR>:5173` y loguearse con dos usuarios distintos.
3. Confirmar que una acción de un usuario (crear una OT, registrar un
   informe) es visible para el otro al refrescar — ambos están leyendo/
   escribiendo la misma base de datos a través de las mismas conexiones
   pooleadas de TypeORM, no hay estado por-sesión en el backend que aísle a
   un usuario del otro.

Si el login falla desde otra máquina con un error de tipo `Failed to fetch` /
`CORS policy` en la consola del navegador, es casi siempre `CORS_ORIGINS`
sin la IP correcta (ver troubleshooting abajo).

## 8. Troubleshooting

**"Failed to fetch" / error de CORS en la consola al loguearse desde otra
máquina** — el origen desde el que se accede al frontend no está en
`CORS_ORIGINS` del `api-gateway`. Agregarlo (separado por coma si hay más de
uno, ej. LAN y VPN si usan puertos/hosts distintos) y reiniciar
`api-gateway`.

**Los microservicios no arrancan / error de conexión a MySQL** — confirmar
que `docker compose up -d` está corriendo (`docker ps` debe mostrar `MYSQL`
como `Up`) y que `DB_HOST`/`DB_PORT` en los `.env` de los microservicios
apuntan ahí.

**Un usuario nuevo no ve el menú correcto** — el sistema de permisos es
solo de UI (oculta botones/rutas según el rol), no hay una segunda capa de
autorización en el backend. Esto ya se documentó como limitación conocida al
implementarlo; no es un bug de la instalación.

**Un microservicio no arranca con un error `QueryFailedError` sobre un
índice/columna al hacer `DROP`/`ALTER`** — `ot-service` e `inventary-service`
declaran copias separadas de las entidades `Process`, `Maquina` y
`SubUnidad` (ambas apuntan a las mismas tablas físicas de `core_db`, cada
una con `synchronize: true`). Si se le agrega una columna o un índice a una
de esas entidades en un servicio, hay que replicar el mismo cambio en la
copia del otro servicio — si no, el que arranque después intenta "corregir"
lo que no reconoce y puede fallar al bootear (o, peor, borrar en silencio
una columna/índice que el otro servicio sí necesita). Esto no es exclusivo
de estos tres modelos: cualquier entidad compartida entre dos servicios con
`synchronize: true` tiene el mismo riesgo.

## 9. Limitaciones conocidas

- **Bundle del frontend grande (~1.5 MB sin comprimir, ~390 KB gzip)**: Vite
  avisa esto en el build. No afecta el funcionamiento, pero en una red
  interna lenta el primer load puede tardar. Se podría mejorar con
  code-splitting (`React.lazy` por feature) si en algún momento se vuelve
  molesto — no es necesario para este despliegue.

**Corregido**: los correlativos de máquinas, procesos y subunidades
(`inventary-service/src/{maquina,process,subUnidad}/*.service.ts`) ahora
calculan el próximo número dentro de una transacción con `SELECT ... FOR
UPDATE`, que serializa creates/updates concurrentes sobre el mismo proceso/
centro de costo/máquina en vez de dejarlos leer el mismo "último valor" en
paralelo. Como respaldo para el caso borde en que no hay ninguna fila previa
que lockear (la primera máquina de un proceso, por ejemplo), cada entidad
tiene además un índice único a nivel de base de datos sobre
`(padre, correlativo)`; si ese caso raro llegara a chocar, el servicio
reintenta una vez automáticamente (`common/concurrency.util.ts`) en vez de
devolver un error al usuario. Verificado disparando 6 creaciones
simultáneas reales contra el mismo proceso: los 6 correlativos salieron
únicos y consecutivos, sin colisiones.
