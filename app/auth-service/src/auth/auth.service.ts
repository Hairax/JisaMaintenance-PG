import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(loginDto: LoginUserDto) {
    try {
      const user = await this.userRepository.findOne({
        where: { userName: loginDto.userName },
      });

      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      if (!user.status) {
        throw new UnauthorizedException('Usuario inactivo');
      }

      const isPasswordValid = loginDto.password === user.password;
      if (!isPasswordValid) {
        throw new UnauthorizedException('Contraseña incorrecta');
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Error al validar las credenciales');
    }
  }

  async login(loginDto: LoginUserDto) {
    const user = await this.validateUser(loginDto);

    const payload = {
      sub: user.id,
      userName: user.userName,
      role: user.cargo,
      email: user.email,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        userName: user.userName,
        email: user.email,
        role: user.cargo,
        name: user.name,
        lastName: user.lastName,
      },
    };
  }

  async validateToken(payload: any) {
    try {
      const user = await this.userRepository.findOne({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      if (!user.status) {
        throw new UnauthorizedException('Usuario inactivo');
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
