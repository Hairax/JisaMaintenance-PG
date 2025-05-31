import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ObjetoService } from './objeto.service';
import { CreateObjetoDto } from './dto/create-objeto.dto';
import { UpdateObjetoDto } from './dto/update-objeto.dto';
import { ResponseObjetoDto } from './dto/response-objeto.dto';

@Controller()
export class ObjetoController {
  constructor(private readonly objetoService: ObjetoService) {}

  @MessagePattern('objeto.create')
  create(@Payload() dto: CreateObjetoDto): Promise<ResponseObjetoDto> {
    return this.objetoService.create(dto);
  }
  @MessagePattern('objeto.findAll')
  findAll(): Promise<ResponseObjetoDto[]> {
    return this.objetoService.findAll();
  }
  @MessagePattern('objeto.findOne')
  findOne(@Payload('id') id: number): Promise<ResponseObjetoDto> {
    return this.objetoService.findOne(id);
  }
  @MessagePattern('objeto.update')
  update(
    @Payload() data: { id: number; dto: UpdateObjetoDto },
  ): Promise<ResponseObjetoDto> {
    return this.objetoService.update(data.id, data.dto);
  }
  @MessagePattern('objeto.remove')
  async remove(
    @Payload() id: number,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.objetoService.remove(id);
      return { success: true };
    } catch (e) {
      return {
        success: false,
        error: e instanceof Error ? e.message : 'Unknown error',
      };
    }
  }
}
