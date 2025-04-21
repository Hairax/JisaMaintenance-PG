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
import { CreateRepuestoDto } from './dto/create-repuesto.dto';
import { UpdateRepuestoDto } from './dto/update-repuesto.dto';
import { ResponseRepuestoDto } from './dto/response-repuesto.dto';

@Controller('repuestos')
export class RepuestoHttpController {
  constructor(
    @Inject('INVENTORY_MICROSERVICE') private readonly client: ClientProxy,
  ) {}
  @Post()
  create(@Body() dto: CreateRepuestoDto): Observable<ResponseRepuestoDto> {
    return this.client.send('repuesto.create', dto);
  }
  @Get()
  findAll(): Observable<ResponseRepuestoDto[]> {
    return this.client.send('repuesto.findAll', {});
  }
  @Get(':id')
  findOne(@Param('id') id: string): Observable<ResponseRepuestoDto> {
    return this.client.send('repuesto.findOne', Number(id));
  }
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRepuestoDto,
  ): Observable<ResponseRepuestoDto> {
    return this.client.send('repuesto.update', { id: Number(id), dto });
  }
  @Delete(':id')
  remove(
    @Param('id') id: string,
  ): Observable<{ success: boolean; error?: string }> {
    return this.client.send('repuesto.remove', Number(id));
  }
}
