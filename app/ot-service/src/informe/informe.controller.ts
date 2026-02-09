import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { InformeService } from './informe.service';
import { CreateInformeDiarioTrabajoDto } from './dto/create-informe-diario-trabajo.dto';
import { UpdateInformeDiarioTrabajoDto } from './dto/update-informe-diario-trabajo.dto';
import { CreateInformeDetalleTrabajoDto } from './dto/create-informe-detalle-trabajo.dto';
import { UpdateInformeDetalleTrabajoDto } from './dto/update-informe-detalle-trabajo.dto';

@Controller('informe')
export class InformeController {
  constructor(private readonly service: InformeService) {}

  // Endpoints para InformeDiarioTrabajo
  @MessagePattern('diario.create')
  createDiario(@Payload() dto: CreateInformeDiarioTrabajoDto) {
    return this.service.createDiario(dto);
  }
  @MessagePattern('diario.findAll')
  findAllDiario() {
    return this.service.findAllDiario();
  }
  @MessagePattern('diario.findOne')
  findOneDiario(@Payload('id') id: string) {
    return this.service.findOneDiario(+id);
  }
  @MessagePattern('diario.update')
  updateDiario(
    @Payload() data: { id: number; dto: UpdateInformeDiarioTrabajoDto },
  ) {
    return this.service.updateDiario(data.id, data.dto);
  }
  @MessagePattern('diario.remove')
  removeDiario(@Payload('id') id: string) {
    return this.service.removeDiario(+id);
  }

  // Endpoints para InformeDetalleTrabajo
  @MessagePattern('detalle.create')
  createDetalle(@Payload() dto: CreateInformeDetalleTrabajoDto) {
    return this.service.createDetalle(dto);
  }
  @MessagePattern('detalle.findAll')
  findAllDetalle() {
    return this.service.findAllDetalle();
  }
  @MessagePattern('detalle.findOne')
  findOneDetalle(@Payload('id') id: string) {
    return this.service.findOneDetalle(+id);
  }
  @MessagePattern('detalle.update')
  updateDetalle(
    @Payload('id') id: string,
    @Payload() dto: UpdateInformeDetalleTrabajoDto,
  ) {
    return this.service.updateDetalle(+id, dto);
  }
  @MessagePattern('detalle.remove')
  removeDetalle(@Payload('id') id: string) {
    return this.service.removeDetalle(+id);
  }
}
