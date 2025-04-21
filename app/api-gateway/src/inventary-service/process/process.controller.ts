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
import { CreateProcessDto } from './dto/create-process.dto';
import { UpdateProcessDto } from './dto/update-process.dto';
import { ResponseProcessDto } from './dto/response-process.dto';

@Controller('process')
export class ProcessHttpController {
  constructor(
    @Inject('INVENTORY_MICROSERVICE') private readonly client: ClientProxy,
  ) {}

  @Post()
  create(@Body() dto: CreateProcessDto): Observable<ResponseProcessDto> {
    return this.client.send('process.create', dto);
  }

  @Get()
  findAll(): Observable<ResponseProcessDto[]> {
    return this.client.send('process.findAll', {});
  }

  @Get(':id')
  findOne(@Param('id') id: string): Observable<ResponseProcessDto> {
    return this.client.send('process.findOne', Number(id));
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProcessDto,
  ): Observable<ResponseProcessDto> {
    return this.client.send('process.update', { id: Number(id), dto });
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
  ): Observable<{ success: boolean; error?: string }> {
    return this.client.send('process.remove', Number(id));
  }
}
