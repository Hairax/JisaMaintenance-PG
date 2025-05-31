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
import { CreateOrdenTrabajoDto } from './dto/create-orden-trabajo.dto';
import { UpdateOrdenTrabajoDto } from './dto/update-orden-trabajo.dto';

@Controller('ots')
export class OtHttpController {
  constructor(
    @Inject('OT_MICROSERVICE') private readonly client: ClientProxy,
  ) {}

  @Post()
  create(
    @Body() dto: CreateOrdenTrabajoDto,
  ): Observable<{ id: number; message: string }> {
    return this.client.send('ot.create', dto);
  }
  @Get()
  findAll(): Observable<{ id: number; message: string }[]> {
    return this.client.send('ot.findAll', {});
  }
  @Get(':id')
  findOne(
    @Param('id') id: string,
  ): Observable<{ id: number; message: string }> {
    return this.client.send('ot.findOne', Number(id));
  }
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateOrdenTrabajoDto,
  ): Observable<{ id: number; message: string }> {
    return this.client.send('ot.update', { id: Number(id), dto });
  }
  @Delete(':id')
  remove(
    @Param('id') id: string,
  ): Observable<{ success: boolean; error?: string }> {
    return this.client.send('ot.remove', Number(id));
  }
}
