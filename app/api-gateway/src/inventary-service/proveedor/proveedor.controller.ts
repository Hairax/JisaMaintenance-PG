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
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { ResponseProveedorDto } from './dto/response-proveedor.dto';

@Controller('proveedores')
export class ProveedorHttpController {
  constructor(
    @Inject('INVENTORY_MICROSERVICE') private readonly client: ClientProxy,
  ) {}
  @Post()
  create(@Body() dto: CreateProveedorDto): Observable<ResponseProveedorDto> {
    return this.client.send('proveedor.create', dto);
  }
  @Get()
  findAll(): Observable<ResponseProveedorDto[]> {
    return this.client.send('proveedor.findAll', {});
  }
  @Get(':id')
  findOne(@Param('id') id: string): Observable<ResponseProveedorDto> {
    return this.client.send('proveedor.findOne', Number(id));
  }
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProveedorDto,
  ): Observable<ResponseProveedorDto> {
    return this.client.send('proveedor.update', { id: Number(id), dto });
  }
  @Delete(':id')
  remove(
    @Param('id') id: string,
  ): Observable<{ success: boolean; error?: string }> {
    return this.client.send('proveedor.remove', Number(id));
  }
}
