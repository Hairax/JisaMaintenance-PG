import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Orígenes permitidos por CORS. Como el frontend se sirve desde el mismo
// servidor al que llega tanto la LAN como la VPN, alcanza con listar la(s)
// dirección(es) fija(s) de ese servidor acá — no una por cada forma de
// conexión. Ver .env.example.
const DEFAULT_ORIGINS = ['http://localhost:5173'];

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
  app.enableCors({
    origin: resolveCorsOrigins(),
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
