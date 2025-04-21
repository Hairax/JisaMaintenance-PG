import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RepuestoService } from './repuesto.service';
import { CreateRepuestoDto } from './dto/create-repuesto.dto';
import { UpdateRepuestoDto } from './dto/update-repuesto.dto';

@Controller()
export class RepuestoController {
  constructor(private readonly repuestoService: RepuestoService) {}

  @MessagePattern('repuesto.create')
  create(@Payload() dto: CreateRepuestoDto) {
    return this.repuestoService.create(dto);
  }

  @MessagePattern('repuesto.findAll')
  findAll() {
    return this.repuestoService.findAll();
  }

  @MessagePattern('repuesto.findOne')
  findOne(@Payload() id: number) {
    return this.repuestoService.findOne(id);
  }

  @MessagePattern('repuesto.update')
  update(@Payload() data: { id: number; dto: UpdateRepuestoDto }) {
    return this.repuestoService.update(data.id, data.dto);
  }

  @MessagePattern('repuesto.remove')
  async remove(@Payload() id: number) {
    try {
      await this.repuestoService.remove(id);
      return { success: true };
    } catch (e) {
      return {
        success: false,
        error: e instanceof Error ? e.message : 'Unknown error',
      };
    }
  }
}
