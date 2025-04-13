import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { DatabaseModule } from './data/database.module';

@Module({
  imports: [UserModule, DatabaseModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
