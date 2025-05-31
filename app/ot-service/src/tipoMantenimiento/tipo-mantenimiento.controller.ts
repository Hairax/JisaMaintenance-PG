import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TipoMantenimientoService } from './tipo-mantenimiento.service';
import { CreateTipoMantenimientoDto } from './dtos/create-tipo-mantenimiento.dto';
import { UpdateTipoMantenimientoDto } from './dtos/update-tipo-mantenimiento.dto';

@Controller()
export class TipoMantenimientoController {
  constructor(
    private readonly tipoMantenimientoService: TipoMantenimientoService,
  ) {}

  @MessagePattern('tipoMantenimiento.create')
  create(@Payload() dto: CreateTipoMantenimientoDto) {
    return this.tipoMantenimientoService.create(dto);
  }

  @MessagePattern('tipoMantenimiento.findAll')
  findAll() {
    return this.tipoMantenimientoService.findAll();
  }

  @MessagePattern('tipoMantenimiento.findOne')
  findOne(@Payload('id') id: string) {
    return this.tipoMantenimientoService.findOne(Number(id));
  }

  @MessagePattern('tipoMantenimiento.update')
  update(@Payload() data: { id: number; dto: UpdateTipoMantenimientoDto }) {
    return this.tipoMantenimientoService.update(data.id, data.dto);
  }

  @MessagePattern('tipoMantenimiento.remove')
  async remove(@Payload() id: number) {
    try {
      await this.tipoMantenimientoService.remove(id);
      return { success: true };
    } catch (e) {
      return {
        success: false,
        error: e instanceof Error ? e.message : 'Unknown error',
      };
    }
  }
}
