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

  private async getNextCorrelativoForMachine(
    maquinaId: number,
  ): Promise<number> {
    const result = await this.subUnidadRepository
      .createQueryBuilder('subunidad')
      .select('MAX(subunidad.correlativo)', 'max')
      .where('subunidad.maquina_id = :maquinaId', { maquinaId })
      .getRawOne<{ max: number }>();

    return (result?.max ?? 0) + 1;
  }

  private async ensureCorrelativoUnique(
    maquinaId: number,
    correlativo: number,
    excludeId?: number,
  ) {
    const query = this.subUnidadRepository
      .createQueryBuilder('subunidad')
      .where('subunidad.maquina_id = :maquinaId', { maquinaId })
      .andWhere('subunidad.correlativo = :correlativo', { correlativo });

    if (excludeId) {
      query.andWhere('subunidad.id != :excludeId', { excludeId });
    }

    const existing = await query.getOne();
    if (existing) {
      throw new Error(
        'El correlativo ya existe para esta máquina. Usa otro número o déjalo vacío.',
      );
    }

    return correlativo;
  }

  async create(dto: CreateSubUnidadDto): Promise<ResponseSubUnidadDto> {
    const correlativo = dto.correlativo
      ? await this.ensureCorrelativoUnique(dto.maquina_id, dto.correlativo)
      : await this.getNextCorrelativoForMachine(dto.maquina_id);

    const subunidad = this.subUnidadRepository.create({
      descripcion: dto.descripcion,
      maquina: { id: dto.maquina_id },
      correlativo,
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
    const subunidad = await this.subUnidadRepository.findOne({
      where: { id },
      relations: ['maquina'],
    });
    if (!subunidad) throw new Error('SubUnidad not found');

    const maquinaId = dto.maquina_id ?? subunidad.maquina.id;
    let correlativo = subunidad.correlativo;

    if (dto.correlativo !== undefined) {
      correlativo = await this.ensureCorrelativoUnique(
        maquinaId,
        dto.correlativo,
        subunidad.id,
      );
    } else if (dto.maquina_id && dto.maquina_id !== subunidad.maquina.id) {
      correlativo = await this.getNextCorrelativoForMachine(maquinaId);
    }

    const updated = this.subUnidadRepository.merge(subunidad, {
      descripcion: dto.descripcion ?? subunidad.descripcion,
      maquina: dto.maquina_id ? { id: dto.maquina_id } : subunidad.maquina,
      correlativo,
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
    correlativo: s.correlativo,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  });
}
