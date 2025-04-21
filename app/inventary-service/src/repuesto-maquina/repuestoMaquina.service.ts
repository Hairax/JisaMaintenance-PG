import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { RepuestoMaquina } from './entities/repuesto-maquina.entity';
import { CreateRepuestoMaquinaDto } from './dto/create-repuesto-maquina.dto';
import { UpdateRepuestoMaquinaDto } from './dto/update-repuesto-maquina.dto';
import { ResponseRepuestoMaquinaDto } from './dto/response-repuesto-maquina.dto';

@Injectable()
export class RepuestoMaquinaService {
  constructor(
    @Inject('REPUESTO_MAQUINA_REPOSITORY')
    private readonly repuestoMaquinaRepository: Repository<RepuestoMaquina>,
  ) {}

  async create(
    createDto: CreateRepuestoMaquinaDto,
  ): Promise<ResponseRepuestoMaquinaDto> {
    const repuesto = this.repuestoMaquinaRepository.create({
      ...createDto,
      createdAt: new Date(),
      updatedAt: new Date(),
      maquina: { id: createDto.maquina_id },
      subUnidad: createDto.subUnidad ? { id: createDto.subUnidad } : null,
    });
    const saved = await this.repuestoMaquinaRepository.save(repuesto);
    return this.toResponseDto(saved);
  }

  async findAll(): Promise<ResponseRepuestoMaquinaDto[]> {
    const repuestos = await this.repuestoMaquinaRepository.find({
      relations: ['maquina', 'subUnidad'],
    });
    return repuestos.map(this.toResponseDto);
  }

  async findOne(id: number): Promise<ResponseRepuestoMaquinaDto> {
    const repuesto = await this.repuestoMaquinaRepository.findOne({
      where: { id },
      relations: ['maquina', 'subUnidad'],
    });
    if (!repuesto) throw new NotFoundException('Repuesto no encontrado');
    return this.toResponseDto(repuesto);
  }

  async update(
    id: number,
    updateDto: UpdateRepuestoMaquinaDto,
  ): Promise<ResponseRepuestoMaquinaDto> {
    const repuesto = await this.repuestoMaquinaRepository.findOne({
      where: { id },
      relations: ['maquina', 'subUnidad'],
    });
    if (!repuesto) throw new NotFoundException('Repuesto no encontrado');

    if (updateDto.maquina_id !== undefined) {
      repuesto.maquina = {
        id: updateDto.maquina_id,
      } as RepuestoMaquina['maquina'];
    }
    if (updateDto.subUnidad !== undefined) {
      repuesto.subUnidad = updateDto.subUnidad
        ? ({ id: updateDto.subUnidad } as RepuestoMaquina['subUnidad'])
        : null;
    }

    Object.assign(repuesto, updateDto, { updatedAt: new Date() });
    const saved = await this.repuestoMaquinaRepository.save(repuesto);
    return this.toResponseDto(saved);
  }

  async remove(id: number): Promise<{ success: boolean; error?: string }> {
    const result = await this.repuestoMaquinaRepository.delete(id);
    if (result.affected === 0) {
      return { success: false, error: 'Repuesto no encontrado' };
    }
    return { success: true };
  }

  private toResponseDto = (
    entity: RepuestoMaquina,
  ): ResponseRepuestoMaquinaDto => ({
    id: entity.id,
    nombre: entity.nombre,
    cantidad: entity.cantidad,
    costoUnitario: entity.costoUnitario,
    descripcion: entity.descripcion,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    maquina_id: entity.maquina?.id,
    subUnidad_id: entity.subUnidad?.id ?? null,
  });
}
