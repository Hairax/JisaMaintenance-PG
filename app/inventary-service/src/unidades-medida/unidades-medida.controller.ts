import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UnidadesMedidaService } from './unidades-medida.service';
import { CreateUnidadMedidaDto } from './dto/create-unidad-medida.dto';
import { UpdateUnidadMedidaDto } from './dto/update-unidad-medida.dto';
import { ResponseUnidadMedidaDto } from './dto/response-unidad-medida.dto';

@Controller()
export class UnidadesMedidaController {
  constructor(private readonly unidadesMedidaService: UnidadesMedidaService) {}

  @MessagePattern('unidades_medida.create')
  create(
    @Payload() createUnidadMedidaDto: CreateUnidadMedidaDto,
  ): Promise<ResponseUnidadMedidaDto> {
    return this.unidadesMedidaService.create(createUnidadMedidaDto);
  }

  @MessagePattern('unidades_medida.findAll')
  findAll(): Promise<ResponseUnidadMedidaDto[]> {
    return this.unidadesMedidaService.findAll();
  }

  @MessagePattern('unidades_medida.findOne')
  findOne(@Payload() id: number): Promise<ResponseUnidadMedidaDto> {
    return this.unidadesMedidaService.findOne(id);
  }

  @MessagePattern('unidades_medida.update')
  update(
    @Payload() data: { id: number; data: UpdateUnidadMedidaDto },
  ): Promise<ResponseUnidadMedidaDto> {
    return this.unidadesMedidaService.update(data.id, data.data);
  }

  @MessagePattern('unidades_medida.remove')
  async remove(@Payload() id: number): Promise<void> {
    return this.unidadesMedidaService.remove(id);
  }
}
