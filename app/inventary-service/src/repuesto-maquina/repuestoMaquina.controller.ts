import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RepuestoMaquinaService } from './repuestoMaquina.service';
import { CreateRepuestoMaquinaDto } from './dto/create-repuesto-maquina.dto';
import { UpdateRepuestoMaquinaDto } from './dto/update-repuesto-maquina.dto';
import { ResponseRepuestoMaquinaDto } from './dto/response-repuesto-maquina.dto';

@Controller()
export class RepuestoMaquinaController {
  constructor(
    private readonly repuestoMaquinaService: RepuestoMaquinaService,
  ) {}

  @MessagePattern('repuesto-maquina.create')
  async create(
    @Payload() createDto: CreateRepuestoMaquinaDto,
  ): Promise<ResponseRepuestoMaquinaDto> {
    return this.repuestoMaquinaService.create(createDto);
  }

  @MessagePattern('repuesto-maquina.findAll')
  findAll(): Promise<ResponseRepuestoMaquinaDto[]> {
    return this.repuestoMaquinaService.findAll();
  }

  @MessagePattern('repuesto-maquina.findOne')
  findOne(@Payload() id: number): Promise<ResponseRepuestoMaquinaDto> {
    return this.repuestoMaquinaService.findOne(id);
  }

  @MessagePattern('repuesto-maquina.update')
  update(
    @Payload() data: { id: number; dto: UpdateRepuestoMaquinaDto },
  ): Promise<ResponseRepuestoMaquinaDto> {
    return this.repuestoMaquinaService.update(data.id, data.dto);
  }

  @MessagePattern('repuesto-maquina.remove')
  async remove(
    @Payload() id: number,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      return await this.repuestoMaquinaService.remove(id);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }
}
