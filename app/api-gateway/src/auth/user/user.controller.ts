import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';

@Controller('user')
export class UserController {
  constructor(@Inject('AUTH_SERVICE') private readonly client: ClientProxy) {}

  @Get()
  getHello(): Observable<string> {
    console.log('llegue a la coneccion con el auth service');
    return this.client.send<string>('hola', {});
  }
}
