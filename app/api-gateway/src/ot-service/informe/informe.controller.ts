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
import { CreateInformeDetalleDto } from './dto/create-informe-detalle.dto';
import { UpdateInformeDetalleDto } from './dto/update-informe-detalle.dto';
import { CreateInformeDiarioDto } from './dto/create-informe-diario.dto';
import { UpdateInformeDiarioDto } from './dto/update-informe-diario.dto';

@Controller('informe')
export class InformeHttpController {
  constructor(
    @Inject('OT_MICROSERVICE') private readonly client: ClientProxy,
  ) {}

  // Endpoints para InformeDiarioTrabajo
  @Post('diario.create')
  createDiario(
    @Body() dto: CreateInformeDiarioDto,
  ): Observable<{ id: number; message: string }> {
    return this.client.send('diario.create', dto);
  }

  @Get('diario.findAll')
  findAllDiario(): Observable<{ id: number; message: string }[]> {
    return this.client.send('diario.findAll', {});
  }

  @Get('diario.findOne')
  findOneDiario(
    @Param('id') id: string,
  ): Observable<{ id: number; message: string }> {
    return this.client.send('diario.findOne', Number(id));
  }

  @Put('diario.update')
  updateDiario(
    @Param('id') id: string,
    @Body() dto: UpdateInformeDiarioDto,
  ): Observable<{ id: number; message: string }> {
    return this.client.send('diario.update', { id: Number(id), dto });
  }

  @Delete('diario.remove')
  removeDiario(
    @Param('id') id: string,
  ): Observable<{ success: boolean; error?: string }> {
    return this.client.send('diario.remove', Number(id));
  }

  // Endpoints para InformeDetalleTrabajo
  @Post('detalle.create')
  createDetalle(
    @Body() dto: CreateInformeDetalleDto,
  ): Observable<{ id: number; message: string }> {
    return this.client.send('detalle.create', dto);
  }

  @Get('detalle.findAll')
  findAllDetalle(): Observable<{ id: number; message: string }[]> {
    return this.client.send('detalle.findAll', {});
  }

  @Get('detalle.findOne')
  findOneDetalle(
    @Param('id') id: string,
  ): Observable<{ id: number; message: string }> {
    return this.client.send('detalle.findOne', Number(id));
  }

  @Put('detalle.update')
  updateDetalle(
    @Param('id') id: string,
    @Body() dto: UpdateInformeDetalleDto,
  ): Observable<{ id: number; message: string }> {
    return this.client.send('detalle.update', { id: Number(id), dto });
  }

  @Delete('detalle.remove')
  removeDetalle(
    @Param('id') id: string,
  ): Observable<{ success: boolean; error?: string }> {
    return this.client.send('detalle.remove', Number(id));
  }
}
