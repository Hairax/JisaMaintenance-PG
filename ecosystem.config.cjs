// Configuración de pm2 para el backend de JisaMaintenance.
//
//   pm2 startOrRestart ecosystem.config.cjs   (levanta o reinicia los 5)
//   pm2 save                                  (recordar la lista)
//
// Lo usan scripts/windows/iniciar-backend.ps1 y actualizar-sistema.ps1.
// Requiere haber compilado antes (`pnpm build`): se ejecuta dist/main.js.
const path = require('path');

const servicio = (nombre) => ({
  name: nombre,
  cwd: path.join(__dirname, 'app', nombre),
  script: 'dist/main.js',
  env: { NODE_ENV: 'production' },
  autorestart: true,
  // Si arranca antes de que MySQL esté listo (o se cae), pm2 lo reintenta
  // con espera creciente (hasta 15 s entre intentos) en vez de rendirse.
  exp_backoff_restart_delay: 1000,
  max_restarts: 1000,
  min_uptime: '10s',
  time: true,
  windowsHide: true,
});

module.exports = {
  // Orden de arranque: primero los microservicios, el gateway al final.
  apps: [
    servicio('auth-service'),
    servicio('users-service'),
    servicio('inventary-service'),
    servicio('ot-service'),
    servicio('api-gateway'),
  ],
};
