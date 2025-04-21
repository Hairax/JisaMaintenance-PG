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
import { CreateSubUnidadDto } from './dtos/create-subunidad.dto';
import { UpdateSubUnidadDto } from './dtos/update-subunidad.dto';
import { ResponseSubUnidadDto } from './dtos/response-subunidad.dto';

@Controller('subunidades')
export class SubUnidadHttpController {
  constructor(
    @Inject('INVENTORY_MICROSERVICE') private readonly client: ClientProxy,
  ) {}
  @Post()
  create(@Body() dto: CreateSubUnidadDto): Observable<ResponseSubUnidadDto> {
    return this.client.send('subunidad.create', dto);
  }
  @Get()
  findAll(): Observable<ResponseSubUnidadDto[]> {
    return this.client.send('subunidad.findAll', {});
  }
  @Get(':id')
  findOne(@Param('id') id: string): Observable<ResponseSubUnidadDto> {
    return this.client.send('subunidad.findOne', Number(id));
  }
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSubUnidadDto,
  ): Observable<ResponseSubUnidadDto> {
    return this.client.send('subunidad.update', { id: Number(id), dto });
  }
  @Delete(':id')
  remove(
    @Param('id') id: string,
  ): Observable<{ success: boolean; error?: string }> {
    return this.client.send('subunidad.remove', Number(id));
  }
}
