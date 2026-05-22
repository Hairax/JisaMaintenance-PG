import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AlmacenService } from './almacen.service';
import { CreateAlmacenDto } from './dto/create-almacen.dto';
import { UpdateAlmacenDto } from './dto/update-almacen.dto';
import { ResponseAlmacenDto } from './dto/response-almacen.dto';

@Controller()
export class AlmacenController {
  constructor(private readonly almacenService: AlmacenService) {}

  @MessagePattern('almacen.create')
  create(
    @Payload() createAlmacenDto: CreateAlmacenDto,
  ): Promise<ResponseAlmacenDto> {
    return this.almacenService.create(createAlmacenDto);
  }

  @MessagePattern('almacen.findAll')
  findAll(): Promise<ResponseAlmacenDto[]> {
    return this.almacenService.findAll();
  }

  @MessagePattern('almacen.findOne')
  findOne(@Payload() id: number): Promise<ResponseAlmacenDto> {
    return this.almacenService.findOne(id);
  }

  @MessagePattern('almacen.update')
  update(
    @Payload() data: { id: number; data: UpdateAlmacenDto },
  ): Promise<ResponseAlmacenDto> {
    return this.almacenService.update(data.id, data.data);
  }

  @MessagePattern('almacen.remove')
  async remove(@Payload() id: number): Promise<void> {
    return this.almacenService.remove(id);
  }
}
