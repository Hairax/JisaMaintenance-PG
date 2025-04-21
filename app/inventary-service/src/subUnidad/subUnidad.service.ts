import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SubUnidad } from './entitites/subUnidad.entity';
import { CreateSubUnidadDto } from './dtos/create-subunidad.dto';
import { UpdateSubUnidadDto } from './dtos/update-subunidad.dto';
import { ResponseSubUnidadDto } from './dtos/response-subunidad.dto';

@Injectable()
export class SubUnidadService {
  constructor(
    @Inject('SUBUNIDAD_REPOSITORY')
    private readonly subUnidadRepository: Repository<SubUnidad>,
  ) {}

  async create(dto: CreateSubUnidadDto): Promise<ResponseSubUnidadDto> {
    const subunidad = this.subUnidadRepository.create({
      descripcion: dto.descripcion,
      maquina: { id: dto.maquina_id },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const saved = await this.subUnidadRepository.save(subunidad);
    return this.toResponseDto(saved);
  }

  async findAll(): Promise<ResponseSubUnidadDto[]> {
    const list = await this.subUnidadRepository.find({
      relations: ['maquina'],
    });
    return list.map(this.toResponseDto);
  }

  async findOne(id: number): Promise<ResponseSubUnidadDto> {
    const subunidad = await this.subUnidadRepository.findOne({
      where: { id },
      relations: ['maquina'],
    });
    if (!subunidad) throw new Error('SubUnidad not found');
    return this.toResponseDto(subunidad);
  }

  async update(
    id: number,
    dto: UpdateSubUnidadDto,
  ): Promise<ResponseSubUnidadDto> {
    const subunidad = await this.subUnidadRepository.findOne({ where: { id } });
    if (!subunidad) throw new Error('SubUnidad not found');

    const updated = this.subUnidadRepository.merge(subunidad, {
      descripcion: dto.descripcion ?? subunidad.descripcion,
      maquina: dto.maquina_id ? { id: dto.maquina_id } : subunidad.maquina,
      updatedAt: new Date(),
    });

    const saved = await this.subUnidadRepository.save(updated);
    return this.toResponseDto(saved);
  }

  async remove(id: number): Promise<void> {
    const subunidad = await this.subUnidadRepository.findOne({ where: { id } });
    if (!subunidad) throw new Error('SubUnidad not found');
    await this.subUnidadRepository.remove(subunidad);
  }

  private toResponseDto = (s: SubUnidad): ResponseSubUnidadDto => ({
    id: s.id,
    descripcion: s.descripcion,
    maquina_id: s.maquina?.id,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  });
}
