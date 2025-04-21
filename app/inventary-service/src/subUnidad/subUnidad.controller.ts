import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SubUnidadService } from './subUnidad.service';
import { CreateSubUnidadDto } from './dtos/create-subunidad.dto';
import { UpdateSubUnidadDto } from './dtos/update-subunidad.dto';

@Controller()
export class SubUnidadController {
  constructor(private readonly subUnidadService: SubUnidadService) {}

  @MessagePattern('subunidad.create')
  create(@Payload() dto: CreateSubUnidadDto) {
    return this.subUnidadService.create(dto);
  }

  @MessagePattern('subunidad.findAll')
  findAll() {
    return this.subUnidadService.findAll();
  }

  @MessagePattern('subunidad.findOne')
  findOne(@Payload() id: number) {
    return this.subUnidadService.findOne(id);
  }

  @MessagePattern('subunidad.update')
  update(@Payload() data: { id: number; dto: UpdateSubUnidadDto }) {
    return this.subUnidadService.update(data.id, data.dto);
  }

  @MessagePattern('subunidad.remove')
  async remove(@Payload() id: number) {
    try {
      await this.subUnidadService.remove(id);
      return { success: true };
    } catch (e) {
      return {
        success: false,
        error: e instanceof Error ? e.message : 'Unknown error',
      };
    }
  }
}
