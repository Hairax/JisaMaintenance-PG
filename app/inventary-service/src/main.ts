import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RpcErrorFilter } from './common/rpc-error.filter';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

// En Windows con Node ≥17, 'localhost' se resuelve primero a IPv6 (::1) y
// el servicio quedaba escuchando solo en [::1], inaccesible para quien se
// conecte por 127.0.0.1. Se usa IPv4 explícito (también si el .env dice
// 'localhost'). Para aceptar conexiones de otra máquina: SERVICE_HOST=0.0.0.0.
const ipv4 = (host?: string) =>
  !host || host.trim().toLowerCase() === 'localhost'
    ? '127.0.0.1'
    : host.trim();

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: ipv4(process.env.SERVICE_HOST),
        port: parseInt(process.env.SERVICE_PORT || '3003'),
      },
    },
  );
  app.useGlobalFilters(new RpcErrorFilter());
  await app.listen();
}
bootstrap();
