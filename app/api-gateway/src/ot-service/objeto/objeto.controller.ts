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
import { CreateObjetoDto } from './dto/create-objeto.dto';
import { UpdateObjetoDto } from './dto/update-objeto.dto';
import { ResponseObjetoDto } from './dto/response-objeto.dto';

@Controller('objetos')
export class ObjetoHttpController {
  constructor(
    @Inject('OT_MICROSERVICE') private readonly client: ClientProxy,
  ) {}

  @Post()
  create(@Body() dto: CreateObjetoDto): Observable<ResponseObjetoDto> {
    return this.client.send('objeto.create', dto);
  }

  @Get()
  findAll(): Observable<ResponseObjetoDto[]> {
    return this.client.send('objeto.findAll', {});
  }

  @Get(':id')
  findOne(@Param('id') id: string): Observable<ResponseObjetoDto> {
    return this.client.send('objeto.findOne', Number(id));
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateObjetoDto,
  ): Observable<ResponseObjetoDto> {
    return this.client.send('objeto.update', { id: Number(id), dto });
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
  ): Observable<{ success: boolean; error?: string }> {
    return this.client.send('objeto.remove', Number(id));
  }
}
