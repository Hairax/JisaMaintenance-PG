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
import { CreateCompraDto } from './dto/create-compra.dto';
import { UpdateCompraDto } from './dto/update-compra.dto';
import { ResponseCompraDto } from './dto/response-compra.dto';

@Controller('compras')
export class CompraHttpController {
  constructor(
    @Inject('INVENTORY_MICROSERVICE') private readonly client: ClientProxy,
  ) {}

  @Post()
  create(@Body() dto: CreateCompraDto): Observable<ResponseCompraDto> {
    return this.client.send('compra.create', dto);
  }

  @Get()
  findAll(): Observable<ResponseCompraDto[]> {
    return this.client.send('compra.findAll', {});
  }

  @Get(':id')
  findOne(@Param('id') id: string): Observable<ResponseCompraDto> {
    return this.client.send('compra.findOne', Number(id));
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCompraDto,
  ): Observable<ResponseCompraDto> {
    return this.client.send('compra.update', { id: Number(id), dto });
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
  ): Observable<{ success: boolean; error?: string }> {
    return this.client.send('compra.remove', Number(id));
  }
}
