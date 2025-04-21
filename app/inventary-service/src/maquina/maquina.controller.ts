import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MaquinaService } from './maquina.service';
import { CreateMaquinaDto } from './dto/create-maquina.dtop';
import { UpdateMaquinaDto } from './dto/update-maquina.dtop';

@Controller()
export class MaquinaController {
  constructor(private readonly maquinaService: MaquinaService) {}

  @MessagePattern('maquina.create')
  create(@Payload() dto: CreateMaquinaDto) {
    return this.maquinaService.create(dto);
  }

  @MessagePattern('maquina.findAll')
  findAll() {
    return this.maquinaService.findAll();
  }

  @MessagePattern('maquina.findOne')
  findOne(@Payload() id: number) {
    return this.maquinaService.findOne(id);
  }

  @MessagePattern('maquina.update')
  update(@Payload() data: { id: number; dto: UpdateMaquinaDto }) {
    return this.maquinaService.update(data.id, data.dto);
  }

  @MessagePattern('maquina.remove')
  async remove(@Payload() id: number) {
    try {
      await this.maquinaService.remove(id);
      return { success: true };
    } catch (e) {
      return {
        success: false,
        error: e instanceof Error ? e.message : 'Unknown error',
      };
    }
  }
}
