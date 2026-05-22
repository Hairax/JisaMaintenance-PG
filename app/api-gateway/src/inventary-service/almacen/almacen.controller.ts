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
import { CreateAlmacenDto } from './dto/create-almacen.dto';
import { UpdateAlmacenDto } from './dto/update-almacen.dto';
import { ResponseAlmacenDto } from './entities/response-almacen.dto';

@Controller('almacen')
export class AlmacenesHttpController {
  constructor(@Inject('INVENTORY_MICROSERVICE') private client: ClientProxy) {}

  @Post()
  create(@Body() createAlmacenDto: CreateAlmacenDto) {
    return this.client.send('almacen.create', createAlmacenDto);
  }

  @Get()
  findAll() {
    return this.client.send('almacen.findAll', {});
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.client.send('almacen.findOne', +id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateAlmacenDto: UpdateAlmacenDto) {
    return this.client.send('almacen.update', {
      id: +id,
      data: updateAlmacenDto,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.client.send('almacen.remove', +id);
  }
}
