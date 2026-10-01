import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { serviceHost } from '../common/service-host';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: {
          host: serviceHost(process.env.AUTH_SERVICE_HOST),
          port: parseInt(process.env.AUTH_SERVICE_PORT || '3001'),
        },
      },
    ]),
  ],
  controllers: [AuthController],
})
export class AuthModule {}
