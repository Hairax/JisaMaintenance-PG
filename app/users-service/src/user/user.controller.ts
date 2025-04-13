import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern('user.create')
  async createUser(@Payload() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  @MessagePattern('user.findAll')
  findAll() {
    return this.userService.findAll();
  }

  @MessagePattern('user.findOne')
  findOne(@Payload() id: number) {
    return this.userService.findOne(id);
  }

  @MessagePattern('user.update')
  update(@Payload() data: { id: number; dto: UpdateUserDto }) {
    return this.userService.update(data.id, data.dto);
  }

  @MessagePattern('user.remove')
  async remove(@Payload() id: number) {
    try {
      await this.userService.remove(id);
      return { success: true };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }
}
