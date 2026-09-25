import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Headers,
  Inject,
  Param,
  Post,
  Put,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UserController {
  constructor(
    @Inject('USER_SERVICE') private readonly client: ClientProxy,
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  @Post()
  createUser(@Body() createUserDto: CreateUserDto): Observable<unknown> {
    return this.client.send('user.create', createUserDto);
  }

  @Get()
  findAllUsers(): Observable<unknown> {
    return this.client.send('user.findAll', {});
  }

  @Get(':id')
  findUserById(@Param('id') id: string): Observable<unknown> {
    return this.client.send('user.findOne', parseInt(id, 10));
  }

  // Cambio de contraseña: solo un administrador autenticado (JWT válido y
  // cargo 'admin' vigente en la base) puede hacerlo.
  @Put(':id/password')
  async changePassword(
    @Param('id') id: string,
    @Body() body: { password?: string },
    @Headers('authorization') authorization?: string,
  ): Promise<{ ok: true }> {
    const token = authorization?.startsWith('Bearer ')
      ? authorization.slice(7)
      : undefined;
    if (!token) throw new UnauthorizedException('Sesión requerida');

    let solicitante: { cargo?: string };
    try {
      solicitante = await firstValueFrom(
        this.authClient.send<{ cargo?: string }>('auth.verify', { token }),
      );
    } catch {
      throw new UnauthorizedException('Sesión inválida o expirada');
    }
    if (solicitante?.cargo !== 'admin') {
      throw new ForbiddenException(
        'Solo un administrador puede cambiar contraseñas',
      );
    }

    const password = body?.password ?? '';
    if (typeof password !== 'string' || password.length < 8) {
      throw new BadRequestException(
        'La contraseña debe tener al menos 8 caracteres',
      );
    }
    if (password.length > 100) {
      throw new BadRequestException(
        'La contraseña no puede superar 100 caracteres',
      );
    }

    await firstValueFrom(
      this.client.send('user.update', {
        id: parseInt(id, 10),
        dto: { password },
      }),
    );
    return { ok: true };
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<unknown> {
    // La contraseña solo se cambia por PUT /users/:id/password (admin).
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...datos } = updateUserDto;
    try {
      const response = await this.client
        .send<unknown>('user.update', {
          id: parseInt(id, 10),
          dto: datos,
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
