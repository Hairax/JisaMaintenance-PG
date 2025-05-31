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
import { CreateTipoMantenimientoDto } from './dto/create-tipo-mantenimiento.dto';
import { UpdateTipoMantenimientoDto } from './dto/update-tipo-mantenimiento.dto';
import { ResponseTipoMantenimientoDto } from './dto/response-tipo-mantenimiento.dto';

@Controller('tipo-mantenimientos')
export class TipoMantenimientoHttpController {
  constructor(
    @Inject('OT_MICROSERVICE') private readonly client: ClientProxy,
  ) {}

  @Post()
  create(
    @Body() dto: CreateTipoMantenimientoDto,
  ): Observable<ResponseTipoMantenimientoDto> {
    return this.client.send('tipoMantenimiento.create', dto);
  }

  @Get()
  findAll(): Observable<ResponseTipoMantenimientoDto[]> {
    return this.client.send('tipoMantenimiento.findAll', {});
  }

  @Get(':id')
  findOne(@Param('id') id: string): Observable<ResponseTipoMantenimientoDto> {
    return this.client.send('tipoMantenimiento.findOne', Number(id));
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTipoMantenimientoDto,
  ): Observable<ResponseTipoMantenimientoDto> {
    return this.client.send('tipoMantenimiento.update', {
      id: Number(id),
      dto,
    });
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
  ): Observable<{ success: boolean; error?: string }> {
    return this.client.send('tipoMantenimiento.remove', Number(id));
  }
}
