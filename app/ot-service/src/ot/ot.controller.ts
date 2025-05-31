import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdenTrabajoService } from './ot.service';
import { CreateOrdenTrabajoDto } from './dto/create-orden-trabajo.dto';
import { UpdateOrdenTrabajoDto } from './dto/update-orden-trabajo.dto';

@Controller()
export class OtController {
  constructor(private readonly otService: OrdenTrabajoService) {}
  @MessagePattern('ot.create')
  create(@Payload() dto: CreateOrdenTrabajoDto) {
    return this.otService.create(dto);
  }
  @MessagePattern('ot.findAll')
  findAll() {
    return this.otService.findAll();
  }
  @MessagePattern('ot.findOne')
  findOne(@Payload('id') id: string) {
    return this.otService.findOne(Number(id));
  }
  @MessagePattern('ot.update')
  update(@Payload() data: { id: number; dto: UpdateOrdenTrabajoDto }) {
    return this.otService.update(data.id, data.dto);
  }
  @MessagePattern('ot.remove')
  async remove(@Payload() id: number) {
    try {
      await this.otService.remove(id);
      return { success: true };
    } catch (e) {
      return {
        success: false,
        error: e instanceof Error ? e.message : 'Unknown error',
      };
    }
  }
}
