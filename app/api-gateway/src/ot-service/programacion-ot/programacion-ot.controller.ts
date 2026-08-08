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
import { CreateProgramacionOtDto } from './dto/create-programacion-ot.dto';
import { UpdateProgramacionOtDto } from './dto/update-programacion-ot.dto';

@Controller('programaciones-ot')
export class ProgramacionOtHttpController {
  constructor(
    @Inject('OT_MICROSERVICE') private readonly client: ClientProxy,
  ) {}

  @Post()
  create(@Body() dto: CreateProgramacionOtDto): Observable<unknown> {
    return this.client.send('programacionOt.create', dto);
  }

  @Get()
  findAll(): Observable<unknown[]> {
    return this.client.send('programacionOt.findAll', {});
  }

  @Get(':id')
  findOne(@Param('id') id: string): Observable<unknown> {
    return this.client.send('programacionOt.findOne', { id: Number(id) });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProgramacionOtDto,
  ): Observable<unknown> {
    return this.client.send('programacionOt.update', {
      id: Number(id),
      dto,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string): Observable<{ deleted: boolean }> {
    return this.client.send('programacionOt.remove', { id: Number(id) });
  }

  @Post(':id/ejecutar')
  ejecutarAhora(@Param('id') id: string): Observable<unknown> {
    return this.client.send('programacionOt.ejecutarAhora', {
      id: Number(id),
    });
  }
}
