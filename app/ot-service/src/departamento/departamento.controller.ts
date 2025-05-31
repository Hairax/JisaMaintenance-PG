import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DepartamentoService } from './departamento.service';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';
import { ResponseDepartamentoDto } from './dto/response-departamento.dto';

@Controller()
export class DepartamentoController {
  constructor(private readonly departamentoService: DepartamentoService) {}

  @MessagePattern('departamento.create')
  create(
    @Payload() dto: CreateDepartamentoDto,
  ): Promise<ResponseDepartamentoDto> {
    return this.departamentoService.create(dto);
  }

  @MessagePattern('departamento.findAll')
  findAll(): Promise<ResponseDepartamentoDto[]> {
    return this.departamentoService.findAll();
  }

  @MessagePattern('departamento.findOne')
  findOne(@Payload('id') id: number): Promise<ResponseDepartamentoDto> {
    return this.departamentoService.findOne(id);
  }

  @MessagePattern('departamento.update')
  update(
    @Payload() data: { id: number; dto: UpdateDepartamentoDto },
  ): Promise<ResponseDepartamentoDto> {
    return this.departamentoService.update(data.id, data.dto);
  }

  @MessagePattern('departamento.remove')
  async remove(
    @Payload() id: number,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.departamentoService.remove(id);
      return { success: true };
    } catch (e) {
      return {
        success: false,
        error: e instanceof Error ? e.message : 'Unknown error',
      };
    }
  }
}
