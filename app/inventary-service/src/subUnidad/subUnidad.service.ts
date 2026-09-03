import { Injectable, Inject } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { SubUnidad } from './entitites/subUnidad.entity';
import { CreateSubUnidadDto } from './dtos/create-subunidad.dto';
import { UpdateSubUnidadDto } from './dtos/update-subunidad.dto';
import { ResponseSubUnidadDto } from './dtos/response-subunidad.dto';
import { runWithDuplicateRetry } from '../common/concurrency.util';

@Injectable()
export class SubUnidadService {
  constructor(
    @Inject('SUBUNIDAD_REPOSITORY')
    private readonly subUnidadRepository: Repository<SubUnidad>,
  ) {}

  // Lockea las subunidades existentes de la máquina mientras calcula el
  // próximo correlativo, para que una segunda transacción concurrente
  // espere a que esta termine en vez de leer el mismo "último" valor.
  private async getNextCorrelativoForMachine(
    manager: EntityManager,
    maquinaId: number,
  ): Promise<number> {
    const result = await manager
      .createQueryBuilder(SubUnidad, 'subunidad')
      .setLock('pessimistic_write')
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
    if (dto.correlativo) {
      const correlativo = await this.ensureCorrelativoUnique(
        dto.maquina_id,
        dto.correlativo,
      );
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

    return runWithDuplicateRetry(() =>
      this.subUnidadRepository.manager.transaction(async (manager) => {
        const correlativo = await this.getNextCorrelativoForMachine(
          manager,
          dto.maquina_id,
        );
        const subunidad = manager.create(SubUnidad, {
          descripcion: dto.descripcion,
          maquina: { id: dto.maquina_id },
          correlativo,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        const saved = await manager.save(subunidad);
        return this.toResponseDto(saved);
      }),
    );
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
    return runWithDuplicateRetry(() =>
      this.subUnidadRepository.manager.transaction(async (manager) => {
        const subunidad = await manager.findOne(SubUnidad, {
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
          correlativo = await this.getNextCorrelativoForMachine(
            manager,
            maquinaId,
          );
        }

        const updated = manager.merge(SubUnidad, subunidad, {
          descripcion: dto.descripcion ?? subunidad.descripcion,
          maquina: dto.maquina_id ? { id: dto.maquina_id } : subunidad.maquina,
          correlativo,
          updatedAt: new Date(),
        });

        const saved = await manager.save(updated);
        return this.toResponseDto(saved);
      }),
    );
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
