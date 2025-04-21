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
import { CreateMaquinaDto } from './dto/create-maquina.dtop';
import { UpdateMaquinaDto } from './dto/update-maquina.dtop';
import { ResponseMaquinaDto } from './dto/response-maquina.dtop';

@Controller('maquinas')
export class MaquinaHttpController {
  constructor(
    @Inject('INVENTORY_MICROSERVICE') private readonly client: ClientProxy,
  ) {}

  @Post()
  create(@Body() dto: CreateMaquinaDto): Observable<ResponseMaquinaDto> {
    return this.client.send('maquina.create', dto);
  }

  @Get()
  findAll(): Observable<ResponseMaquinaDto[]> {
    return this.client.send('maquina.findAll', {});
  }

  @Get(':id')
  findOne(@Param('id') id: string): Observable<ResponseMaquinaDto> {
    return this.client.send('maquina.findOne', Number(id));
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMaquinaDto,
  ): Observable<ResponseMaquinaDto> {
    return this.client.send('maquina.update', { id: Number(id), dto });
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
  ): Observable<{ success: boolean; error?: string }> {
    return this.client.send('maquina.remove', Number(id));
  }
}
