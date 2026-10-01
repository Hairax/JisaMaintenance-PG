import './load-env';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceInterceptor } from './common/microservice.interceptor';

// Orígenes permitidos por CORS. Como el frontend se sirve desde el mismo
// servidor al que llega tanto la LAN como la VPN, alcanza con listar la(s)
// dirección(es) fija(s) de ese servidor en CORS_ORIGINS — no una por cada
// forma de conexión. Ver .env.example.
// Sin CORS_ORIGINS solo se acepta el acceso local en el propio servidor:
// Vite en desarrollo (:3333, ver web-app/vite.config.ts) e IIS (:8095).
const DEFAULT_ORIGINS = [
  'http://localhost:3333',
  'http://127.0.0.1:3333',
  'http://localhost:8095',
  'http://127.0.0.1:8095',
];

function resolveCorsOrigins(): string[] {
  const raw = process.env.CORS_ORIGINS;
  if (!raw || raw.trim() === '') return DEFAULT_ORIGINS;
  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new MicroserviceInterceptor());
  const origins = resolveCorsOrigins();
  app.enableCors({
    origin: origins,
    credentials: true,
  });
  // Visible en `pm2 logs api-gateway`: confirma qué orígenes tomó del .env.
  console.log(`CORS: orígenes permitidos -> ${origins.join(', ')}`);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
