import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Proveedor } from './entities/proveedor.entity';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { ResponseProveedorDto } from './dto/response-proveedor.dto';

@Injectable()
export class ProveedorService {
  constructor(
    @Inject('PROVEEDOR_REPOSITORY')
    private proveedorRepository: Repository<Proveedor>,
  ) {}

  async create(dto: CreateProveedorDto): Promise<ResponseProveedorDto> {
    const proveedor = this.proveedorRepository.create({
      nombre: dto.nombre,
      ruc: dto.ruc,
      correoElectronico: dto.correoElectronico,
      telefono: dto.telefono,
      direccion: dto.direccion,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const saved = await this.proveedorRepository.save(proveedor);
    return this.toResponseDto(saved);
  }

  async findAll(): Promise<ResponseProveedorDto[]> {
    const proveedores = await this.proveedorRepository.find();
    return proveedores.map(this.toResponseDto);
  }

  async findOne(id: number): Promise<ResponseProveedorDto> {
    const proveedor = await this.proveedorRepository.findOne({ where: { id } });
    if (!proveedor) throw new Error('Proveedor not found');
    return this.toResponseDto(proveedor);
  }

  async update(
    id: number,
    dto: UpdateProveedorDto,
  ): Promise<ResponseProveedorDto> {
    const proveedor = await this.proveedorRepository.findOne({ where: { id } });
    if (!proveedor) throw new Error('Proveedor not found');
    const updated = this.proveedorRepository.merge(proveedor, {
      ...dto,
      nombre: dto.nombre ?? proveedor.nombre,
      updatedAt: new Date(),
    });
    const saved = await this.proveedorRepository.save(updated);
    return this.toResponseDto(saved);
  }

  async remove(id: number): Promise<void> {
    const proveedor = await this.proveedorRepository.findOne({ where: { id } });
    if (!proveedor) throw new Error('Proveedor not found');
    await this.proveedorRepository.remove(proveedor);
  }

  private toResponseDto = (p: Proveedor): ResponseProveedorDto => ({
    id: p.id,
    nombre: p.nombre,
    ruc: p.ruc,
    correoElectronico: p.correoElectronico,
    telefono: p.telefono,
    direccion: p.direccion,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  });
}
