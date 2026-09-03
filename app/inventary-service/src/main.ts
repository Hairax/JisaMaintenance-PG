import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.SERVICE_HOST || 'localhost',
        port: parseInt(process.env.SERVICE_PORT || '3003'),
      },
    },
  );
  await app.listen();
}
bootstrap();
