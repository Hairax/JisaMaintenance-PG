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
import { CreateCostCenterDto } from './dto/create-cost-center.dto';
import { UpdateCostCenterDto } from './dto/update-cost-center.dto';
import { ResponseCostCenterDto } from './dto/response-cost-center-dto';

@Controller('cost-centers')
export class CostCenterHttpController {
  constructor(
    @Inject('INVENTORY_MICROSERVICE') private readonly client: ClientProxy,
  ) {}

  @Post()
  create(@Body() dto: CreateCostCenterDto): Observable<ResponseCostCenterDto> {
    return this.client.send('cost-center.create', dto);
  }

  @Get()
  findAll(): Observable<ResponseCostCenterDto[]> {
    return this.client.send('cost-center.findAll', {});
  }

  @Get(':id')
  findOne(@Param('id') id: string): Observable<ResponseCostCenterDto> {
    return this.client.send('cost-center.findOne', Number(id));
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCostCenterDto,
  ): Observable<ResponseCostCenterDto> {
    return this.client.send('cost-center.update', { id: Number(id), dto });
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
  ): Observable<{ success: boolean; error?: string }> {
    return this.client.send('cost-center.remove', Number(id));
  }
}
