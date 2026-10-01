# web-app

Frontend de JisaMaintenance: React + TypeScript + Vite + Tailwind.

## Desarrollo

```bash
pnpm dev          # desde esta carpeta, o `pnpm dev:app` desde la raíz
```

El servidor de desarrollo está fijado en `vite.config.ts`:

```ts
server: {
  host: '127.0.0.1',
  port: 3333,
},
```

Se abre en `http://localhost:3333`. Con `host: '127.0.0.1'` solo es
accesible desde la misma máquina; para probarlo desde otras PCs de la red,
usar `host: '0.0.0.0'`.

## Build y publicación

```bash
pnpm build        # genera dist/
```

`dist/` es lo que se publica en IIS (puerto 8095). Incluye `web.config`
(copiado desde `public/web.config`) con la regla para que las rutas del
frontend (`/login`, `/home`…) carguen `index.html`. Detalles en
[DEPLOY.md](../../DEPLOY.md), sección 6.2.

## URL del API

No hace falta configurarla: `src/shared/config/api.ts` usa el mismo host con
el que se abrió el sitio y el puerto 3000 (ej. desde
`http://192.168.5.5:8095` llama a `http://192.168.5.5:3000`). Para otro
destino, definir `VITE_API_URL` en `.env` antes del build (ver
`.env.example`).
