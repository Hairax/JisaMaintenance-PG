import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user-service/user.module';
import { InventaryModule } from './inventary-service/inventary.module';

@Module({
  imports: [AuthModule, UserModule, InventaryModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
