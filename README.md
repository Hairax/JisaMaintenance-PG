# JisaMaintenance

Sistema de gestión de mantenimiento (órdenes de trabajo, inventario de
repuestos, compras, salidas, reportes contables y KPIs). Monorepo pnpm con un
frontend React y un backend de microservicios NestJS.

| Carpeta                 | Qué es                               | Puerto                   |
| ----------------------- | ------------------------------------ | ------------------------ |
| `app/web-app`           | Frontend React + Vite                | 3333 (dev) / 8095 (IIS)  |
| `app/api-gateway`       | API HTTP (única entrada del frontend) | 3000                     |
| `app/auth-service`      | Login / JWT                          | 3001 (TCP, `127.0.0.1`)  |
| `app/users-service`     | Usuarios                             | 3002 (TCP, `127.0.0.1`)  |
| `app/inventary-service` | Inventario, compras, salidas         | 3003 (TCP, `127.0.0.1`)  |
| `app/ot-service`        | Órdenes de trabajo, informes         | 3004 (TCP, `127.0.0.1`)  |
| `infrastructure`        | MySQL en Docker                      | 3010                     |

## Desarrollo

Requisitos: Node.js 22 LTS, pnpm 10.8+, Docker Desktop.

```bash
pnpm install
cd infrastructure && docker compose up -d && cd ..
pnpm dev            # levanta los 5 servicios y el frontend
```

Frontend en `http://localhost:3333`, API en `http://localhost:3000`.

Otros comandos: `pnpm build` (compila todo), `pnpm start:prod` (backends
compilados), `pnpm lint`, `pnpm format`.

## Producción

Ver [DEPLOY.md](DEPLOY.md): instalación en el servidor Windows, variables de
entorno (`CORS_ORIGINS`), pm2, publicación del frontend en IIS (puerto 8095),
firewall, verificación y troubleshooting.

En el servidor, para operar el día a día (`scripts\windows`):

- **`iniciar-backend.bat`**: levanta Docker, MySQL y los 5 servicios tras un
  reinicio o apagón, y verifica que todo responda.
- **`actualizar-sistema.bat`**: baja la última versión, compila y reinicia.
