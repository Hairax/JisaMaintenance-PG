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
import { CreateRepuestoMaquinaDto } from './dto/create-repuesto-maquina.dto';
import { UpdateRepuestoMaquinaDto } from './dto/update-repuesto-maquina.dto';
import { ResponseRepuestoMaquinaDto } from './dto/response-repuesto-maquina.dto';

@Controller('repuesto-maquina')
export class RespuestoMaquinaHttpController {
  constructor(
    @Inject('INVENTORY_MICROSERVICE') private readonly client: ClientProxy,
  ) {}

  @Post()
  create(
    @Body() dto: CreateRepuestoMaquinaDto,
  ): Observable<ResponseRepuestoMaquinaDto> {
    return this.client.send('repuesto-maquina.create', dto);
  }

  @Get()
  findAll(): Observable<ResponseRepuestoMaquinaDto[]> {
    return this.client.send('repuesto-maquina.findAll', {});
  }

  @Get(':id')
  findOne(@Param('id') id: string): Observable<ResponseRepuestoMaquinaDto> {
    return this.client.send('repuesto-maquina.findOne', Number(id));
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRepuestoMaquinaDto,
  ): Observable<ResponseRepuestoMaquinaDto> {
    return this.client.send('repuesto-maquina.update', { id: Number(id), dto });
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
  ): Observable<{ success: boolean; error?: string }> {
    return this.client.send('repuesto-maquina.remove', Number(id));
  }
}
