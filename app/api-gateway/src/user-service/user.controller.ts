import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UserController {
  constructor(@Inject('USER_SERVICE') private readonly client: ClientProxy) {}

  @Post()
  createUser(@Body() createUserDto: CreateUserDto): Observable<any> {
    return this.client.send('user.create', createUserDto);
  }

  @Get()
  findAllUsers(): Observable<any> {
    return this.client.send('user.findAll', {});
  }

  @Get(':id')
  findUserById(@Param('id') id: string): Observable<any> {
    return this.client.send('user.findOne', { id });
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<unknown> {
    try {
      const response = await this.client
        .send<unknown>('user.update', {
          id: parseInt(id, 10),
          dto: updateUserDto,
        })
        .toPromise();

      if (!response) {
        throw new Error('No se recibió respuesta del servicio');
      }

      return response;
    } catch (error) {
      console.error('Error en la actualización:', error);
      throw error;
    }
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<unknown> {
    try {
      const response = await this.client
        .send<unknown>('user.remove', parseInt(id, 10))
        .toPromise();

      if (!response) {
        throw new Error('No se recibió respuesta del servicio');
      }

      return response;
    } catch (error) {
      console.error('Error en la eliminación:', error);
      throw error;
    }
  }
}
