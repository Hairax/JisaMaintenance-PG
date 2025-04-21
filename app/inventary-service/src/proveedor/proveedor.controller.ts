import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProveedorService } from './proveedor.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';

@Controller()
export class ProveedorController {
  constructor(private readonly proveedorService: ProveedorService) {}

  @MessagePattern('proveedor.create')
  create(@Payload() dto: CreateProveedorDto) {
    return this.proveedorService.create(dto);
  }

  @MessagePattern('proveedor.findAll')
  findAll() {
    return this.proveedorService.findAll();
  }

  @MessagePattern('proveedor.findOne')
  findOne(@Payload() id: number) {
    return this.proveedorService.findOne(id);
  }

  @MessagePattern('proveedor.update')
  update(@Payload() data: { id: number; dto: UpdateProveedorDto }) {
    return this.proveedorService.update(data.id, data.dto);
  }

  @MessagePattern('proveedor.remove')
  async remove(@Payload() id: number) {
    try {
      await this.proveedorService.remove(id);
      return { success: true };
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }
}
