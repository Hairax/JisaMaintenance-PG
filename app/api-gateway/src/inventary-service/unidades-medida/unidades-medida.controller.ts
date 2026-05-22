import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUnidadMedidaDto } from './dto/create-unidad-medida.dto';
import { UpdateUnidadMedidaDto } from './dto/update-unidad-medida.dto';
import { ResponseUnidadMedidaDto } from './entities/response-unidad-medida.dto';

@Controller('unidades-medida')
export class UnidadesMedidaHttpController {
  constructor(@Inject('INVENTORY_MICROSERVICE') private client: ClientProxy) {}

  @Post()
  create(@Body() createUnidadMedidaDto: CreateUnidadMedidaDto) {
    return this.client.send('unidades_medida.create', createUnidadMedidaDto);
  }

  @Get()
  findAll() {
    return this.client.send('unidades_medida.findAll', {});
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.client.send('unidades_medida.findOne', +id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateUnidadMedidaDto: UpdateUnidadMedidaDto,
  ) {
    return this.client.send('unidades_medida.update', {
      id: +id,
      data: updateUnidadMedidaDto,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.client.send('unidades_medida.remove', +id);
  }
}
