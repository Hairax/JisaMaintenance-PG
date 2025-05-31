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
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';
import { ResponseDepartamentoDto } from './dto/response-departamento.dto';

@Controller('departamentos')
export class DepartamentoHttpController {
  constructor(
    @Inject('OT_MICROSERVICE') private readonly client: ClientProxy,
  ) {}

  @Post()
  create(
    @Body() dto: CreateDepartamentoDto,
  ): Observable<ResponseDepartamentoDto> {
    return this.client.send('departamento.create', dto);
  }

  @Get()
  findAll(): Observable<ResponseDepartamentoDto[]> {
    return this.client.send('departamento.findAll', {});
  }

  @Get(':id')
  findOne(@Param('id') id: string): Observable<ResponseDepartamentoDto> {
    return this.client.send('departamento.findOne', Number(id));
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDepartamentoDto,
  ): Observable<ResponseDepartamentoDto> {
    return this.client.send('departamento.update', { id: Number(id), dto });
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
  ): Observable<{ success: boolean; error?: string }> {
    return this.client.send('departamento.remove', Number(id));
  }
}
