import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SalidaService } from './salida.service';
import { CreateSalidaDto } from './dto/create-salida.dto';
import { UpdateSalidaDto } from './dto/update-salida.dto';

@Controller()
export class SalidaController {
  constructor(private readonly salidaService: SalidaService) {}

  @MessagePattern('create_salida')
  async create(@Payload() createSalidaDto: CreateSalidaDto) {
    return this.salidaService.create(createSalidaDto);
  }

  @MessagePattern('find_all_salida')
  async findAll() {
    return this.salidaService.findAll();
  }

  @MessagePattern('find_one_salida')
  async findOne(@Payload() id: number) {
    return this.salidaService.findOne(id);
  }

  @MessagePattern('update_salida')
  async update(
    @Payload() { id, ...updateSalidaDto }: { id: number } & UpdateSalidaDto,
  ) {
    return this.salidaService.update(id, updateSalidaDto);
  }

  @MessagePattern('remove_salida')
  async remove(@Payload() id: number) {
    await this.salidaService.remove(id);
    return { message: 'Salida deleted' };
  }
}
