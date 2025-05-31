import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TipoMantenimiento } from './entities/tipoMantenimiento.entity';
import { CreateTipoMantenimientoDto } from './dtos/create-tipo-mantenimiento.dto';
import { UpdateTipoMantenimientoDto } from './dtos/update-tipo-mantenimiento.dto';
import { ResponseTipoMantenimientoDto } from './dtos/response-tipo-mantenimiento.dto';

@Injectable()
export class TipoMantenimientoService {
  constructor(
    @Inject('TIPO_MANTENIMIENTO_REPOSITORY')
    private readonly tipoMantenimientoRepository: Repository<TipoMantenimiento>,
  ) {}

  async create(
    dto: CreateTipoMantenimientoDto,
  ): Promise<ResponseTipoMantenimientoDto> {
    const entity = this.tipoMantenimientoRepository.create({
      ...dto,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const saved = await this.tipoMantenimientoRepository.save(entity);
    return this.toResponseDto(saved);
  }

  async findAll(): Promise<ResponseTipoMantenimientoDto[]> {
    const list = await this.tipoMantenimientoRepository.find();
    return list.map((entity) => this.toResponseDto(entity));
  }

  async findOne(id: number): Promise<ResponseTipoMantenimientoDto> {
    const entity = await this.tipoMantenimientoRepository.findOne({
      where: { id },
    });
    if (!entity)
      throw new NotFoundException('Tipo de mantenimiento no encontrado');
    return this.toResponseDto(entity);
  }

  async update(
    id: number,
    dto: UpdateTipoMantenimientoDto,
  ): Promise<ResponseTipoMantenimientoDto> {
    const entity = await this.tipoMantenimientoRepository.findOne({
      where: { id },
    });
    if (!entity)
      throw new NotFoundException('Tipo de mantenimiento no encontrado');
    const updated = this.tipoMantenimientoRepository.merge(entity, {
      ...dto,
      updatedAt: new Date(),
    });
    const saved = await this.tipoMantenimientoRepository.save(updated);
    return this.toResponseDto(saved);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.tipoMantenimientoRepository.findOne({
      where: { id },
    });
    if (!entity)
      throw new NotFoundException('Tipo de mantenimiento no encontrado');
    await this.tipoMantenimientoRepository.remove(entity);
  }

  private toResponseDto = (
    entity: TipoMantenimiento,
  ): ResponseTipoMantenimientoDto => ({
    id: entity.id,
    nombre: entity.nombre,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  });
}
