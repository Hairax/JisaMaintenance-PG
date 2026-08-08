import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProgramacionOtService } from './programacion-ot.service';
import { CreateProgramacionOtDto } from './dto/create-programacion-ot.dto';
import { UpdateProgramacionOtDto } from './dto/update-programacion-ot.dto';

@Controller()
export class ProgramacionOtController {
  constructor(private readonly service: ProgramacionOtService) {}

  @MessagePattern('programacionOt.create')
  create(@Payload() dto: CreateProgramacionOtDto) {
    return this.service.create(dto);
  }

  @MessagePattern('programacionOt.findAll')
  findAll() {
    return this.service.findAll();
  }

  @MessagePattern('programacionOt.findOne')
  findOne(@Payload() data: { id: number }) {
    return this.service.findOne(Number(data.id));
  }

  @MessagePattern('programacionOt.update')
  update(@Payload() data: { id: number; dto: UpdateProgramacionOtDto }) {
    return this.service.update(data.id, data.dto);
  }

  @MessagePattern('programacionOt.remove')
  remove(@Payload() data: { id: number }) {
    return this.service.remove(Number(data.id));
  }

  @MessagePattern('programacionOt.ejecutarAhora')
  ejecutarAhora(@Payload() data: { id: number }) {
    return this.service.ejecutarAhora(Number(data.id));
  }
}
