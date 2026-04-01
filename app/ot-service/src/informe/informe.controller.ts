import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { InformeService } from './informe.service';
import { CreateInformeDto } from './dto/create-informe.dto';
import { UpdateInformeDto } from './dto/update-informe.dto';

@Controller('informe')
export class InformeController {
  constructor(private readonly service: InformeService) {}

  @MessagePattern('informe.create')
  create(@Payload() dto: CreateInformeDto) {
    return this.service.create(dto);
  }

  @MessagePattern('informe.findAll')
  findAll() {
    return this.service.findAll();
  }

  @MessagePattern('informe.findOne')
  findOne(@Payload('id') id: string) {
    return this.service.findOne(+id);
  }

  @MessagePattern('informe.update')
  update(@Payload() data: { id: number; dto: UpdateInformeDto }) {
    return this.service.update(data.id, data.dto);
  }

  @MessagePattern('informe.remove')
  remove(@Payload('id') id: string) {
    return this.service.remove(+id);
  }
}
