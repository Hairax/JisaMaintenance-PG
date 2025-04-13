import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { UserWithPassword } from '../auth/interfaces/user.interface';

@Injectable()
export class UserService {
  constructor(@Inject('API_GATEWAY') private readonly client: ClientProxy) {}

  async findByUserName(userName: string): Promise<UserWithPassword> {
    const user = await firstValueFrom(
      this.client.send<UserWithPassword>('auth.findByUserName', { userName }),
    );
    return user;
  }

  async findOne(id: number): Promise<UserWithPassword> {
    const user = await firstValueFrom(
      this.client.send<UserWithPassword>('auth.findOne', { id }),
    );
    return user;
  }
}
