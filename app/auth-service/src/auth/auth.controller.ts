import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.login')
  async login(@Payload() loginDto: LoginUserDto) {
    console.log('🟢 Recibido login', loginDto);
    try {
      const res = await this.authService.login(loginDto);
      console.log('✅ Login exitoso', res);
      return res;
    } catch (error) {
      console.error('❌ Error en login', error);
      throw error; // Esto se propaga bien si es HttpException o RpcException
    }
  }

  // Valida un JWT emitido por este servicio y devuelve el usuario vigente
  // (sin contraseña). Lo usa el api-gateway para proteger endpoints.
  @MessagePattern('auth.verify')
  verify(@Payload() data: { token: string }) {
    return this.authService.verifyToken(data?.token);
  }
}
