import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CompraService } from './compra.service';
import { CreateCompraDto } from './dto/create-compra.dto';
import { UpdateCompraDto } from './dto/update-compra.dto';
import { Compra } from './entities/compra.entity';
import { ResponseCompraDto } from './dto/response-compra.dto';

@Controller()
export class CompraController {
  constructor(private readonly compraService: CompraService) {}

  @MessagePattern('compra.create')
  async createCompra(
    @Payload() createCompraDto: CreateCompraDto,
  ): Promise<ResponseCompraDto> {
    return await this.compraService.create(createCompraDto);
  }

  @MessagePattern('compra.findAll')
  findAll(): Promise<Compra[]> {
    return this.compraService.findAll();
  }

  @MessagePattern('compra.findOne')
  findOne(@Payload() id: number): Promise<Compra> {
    return this.compraService.findOne(id);
  }

  @MessagePattern('compra.update')
  update(
    @Payload() data: { id: number; dto: UpdateCompraDto },
  ): Promise<Compra> {
    return this.compraService.update(data.id, data.dto);
  }

  @MessagePattern('compra.remove')
  async remove(
    @Payload() id: number,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.compraService.remove(id);
      return { success: true };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }
}
