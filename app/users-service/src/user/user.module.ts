import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { InitializationService } from './initialization.service';
import { userProviders } from './db/user.providers';
import { DatabaseModule } from '../data/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [UserController],
  providers: [...userProviders, UserService, InitializationService],
  exports: [UserService],
})
export class UserModule {}
