import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Repuesto } from './entities/repuesto.entity';
import { CreateRepuestoDto } from './dto/create-repuesto.dto';
import { UpdateRepuestoDto } from './dto/update-repuesto.dto';
import { ResponseRepuestoDto } from './dto/response-repuesto.dto';

@Injectable()
export class RepuestoService {
  constructor(
    @Inject('REPUESTO_REPOSITORY')
    private readonly repuestoRepository: Repository<Repuesto>,
  ) {}

  async create(dto: CreateRepuestoDto): Promise<ResponseRepuestoDto> {
    const repuesto = this.repuestoRepository.create({
      nombre: dto.nombre,
      cantidad: dto.cantidad,
      costoUnitario: dto.costoUnitario,
      descripcion: dto.descripcion,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const saved = await this.repuestoRepository.save(repuesto);
    return this.toResponseDto(saved);
  }

  async findAll(): Promise<ResponseRepuestoDto[]> {
    const list = await this.repuestoRepository.find();
    return list.map(this.toResponseDto);
  }

  async findOne(id: number): Promise<ResponseRepuestoDto> {
    const repuesto = await this.repuestoRepository.findOne({ where: { id } });
    if (!repuesto) throw new Error('Repuesto not found');
    return this.toResponseDto(repuesto);
  }

  async update(
    id: number,
    dto: UpdateRepuestoDto,
  ): Promise<ResponseRepuestoDto> {
    const repuesto = await this.repuestoRepository.findOne({ where: { id } });
    if (!repuesto) throw new Error('Repuesto not found');

    const updated = this.repuestoRepository.merge(repuesto, {
      ...dto,
      updatedAt: new Date(),
    });

    const saved = await this.repuestoRepository.save(updated);
    return this.toResponseDto(saved);
  }

  async remove(id: number): Promise<void> {
    const repuesto = await this.repuestoRepository.findOne({ where: { id } });
    if (!repuesto) throw new Error('Repuesto not found');
    await this.repuestoRepository.remove(repuesto);
  }

  private toResponseDto = (r: Repuesto): ResponseRepuestoDto => ({
    id: r.id,
    nombre: r.nombre,
    cantidad: r.cantidad,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    costoUnitario: r.costoUnitario,
    descripcion: r.descripcion,
  });
}
