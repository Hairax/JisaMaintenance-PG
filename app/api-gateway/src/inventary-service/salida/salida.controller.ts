import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateSalidaDto } from './dto/create-salida.dto';
import { UpdateSalidaDto } from './dto/update-salida.dto';

@Controller('salidas')
export class SalidaHttpController {
  constructor(
    @Inject('INVENTORY_MICROSERVICE') private inventoryClient: ClientProxy,
  ) {}

  @Post()
  async create(@Body() createSalidaDto: CreateSalidaDto) {
    return firstValueFrom(
      this.inventoryClient.send('create_salida', createSalidaDto),
    );
  }

  @Get()
  async findAll() {
    return firstValueFrom(this.inventoryClient.send('find_all_salida', {}));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return firstValueFrom(
      this.inventoryClient.send('find_one_salida', Number(id)),
    );
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSalidaDto: UpdateSalidaDto,
  ) {
    return firstValueFrom(
      this.inventoryClient.send('update_salida', {
        id: Number(id),
        ...updateSalidaDto,
      }),
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return firstValueFrom(
      this.inventoryClient.send('remove_salida', Number(id)),
    );
  }
}
