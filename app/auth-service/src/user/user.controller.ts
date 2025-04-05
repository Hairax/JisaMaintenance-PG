import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller('user')
export class UserController {
  @MessagePattern('hola')
  getHello(): string {
    console.log('llegue a hola');
    return 'Hello from user service';
  }
}
