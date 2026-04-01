import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { CreateInformeDto } from './dto/create-informe.dto';
import { UpdateInformeDto } from './dto/update-informe.dto';

@Controller('informes')
export class InformeHttpController {
  constructor(
    @Inject('OT_MICROSERVICE') private readonly client: ClientProxy,
  ) {}

  @Post()
  create(@Body() dto: CreateInformeDto) {
    return this.client.send('informe.create', dto);
  }

  @Get()
  findAll() {
    return this.client.send('informe.findAll', {});
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.client.send('informe.findOne', { id: parseInt(id) });
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateInformeDto) {
    return this.client.send('informe.update', { id: parseInt(id), dto });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.client.send('informe.remove', { id: parseInt(id) });
  }
}
