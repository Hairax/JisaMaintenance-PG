import { Injectable, OnModuleInit } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from './enum/userRol.enum';

@Injectable()
export class InitializationService implements OnModuleInit {
  constructor(private readonly userService: UserService) {}

  async onModuleInit() {
    await this.initializeAdminUser();
  }

  private async initializeAdminUser() {
    try {
      // Buscar si ya existe un administrador
      const users = await this.userService.findAll();
      const adminExists = users.some((user) => user.cargo === UserRole.ADMIN);

      if (!adminExists) {
        const adminUser: CreateUserDto = {
          name: 'Admin',
          lastName: 'System',
          email: 'admin@jisa.com',
          password: 'Admin123!',
          cargo: UserRole.ADMIN,
          phone: '+541112345678',
          celphone: '+541112345678',
          hora$: 0,
          minutos$: 0,
          userName: 'admin',
          status: true,
        };

        await this.userService.create(adminUser);
        console.log('Usuario administrador creado exitosamente');
      } else {
        console.log('Ya existe un usuario administrador');
      }
    } catch (error) {
      console.error('Error al inicializar el usuario administrador:', error);
    }
  }
}
