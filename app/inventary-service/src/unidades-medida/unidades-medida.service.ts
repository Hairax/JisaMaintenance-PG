import {
  Inject,
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { UnidadMedida } from './entities/unidad-medida.entity';
import { CreateUnidadMedidaDto } from './dto/create-unidad-medida.dto';
import { UpdateUnidadMedidaDto } from './dto/update-unidad-medida.dto';
import { ResponseUnidadMedidaDto } from './dto/response-unidad-medida.dto';

@Injectable()
export class UnidadesMedidaService {
  constructor(
    @Inject('UNIDAD_MEDIDA_REPOSITORY')
    private unidadMedidaRepository: Repository<UnidadMedida>,
  ) {}

  async create(
    createUnidadMedidaDto: CreateUnidadMedidaDto,
  ): Promise<ResponseUnidadMedidaDto> {
    // Check if codigo already exists
    const existing = await this.unidadMedidaRepository.findOne({
      where: { codigo: createUnidadMedidaDto.codigo },
    });
    if (existing) {
      throw new ConflictException(
        `Unidad de medida con código ${createUnidadMedidaDto.codigo} ya existe`,
      );
    }

    const unidadMedida = this.unidadMedidaRepository.create(
      createUnidadMedidaDto,
    );
    const result = await this.unidadMedidaRepository.save(unidadMedida);
    return this.mapToDto(result);
  }

  async findAll(): Promise<ResponseUnidadMedidaDto[]> {
    const unidades = await this.unidadMedidaRepository.find({
      order: { nombre: 'ASC' },
    });
    return unidades.map((u) => this.mapToDto(u));
  }

  async findOne(id: number): Promise<ResponseUnidadMedidaDto> {
    const unidadMedida = await this.unidadMedidaRepository.findOne({
      where: { id },
    });
    if (!unidadMedida) {
      throw new NotFoundException(
        `Unidad de medida con ID ${id} no encontrada`,
      );
    }
    return this.mapToDto(unidadMedida);
  }

  async update(
    id: number,
    updateUnidadMedidaDto: UpdateUnidadMedidaDto,
  ): Promise<ResponseUnidadMedidaDto> {
    const unidadMedida = await this.unidadMedidaRepository.findOne({
      where: { id },
    });
    if (!unidadMedida) {
      throw new NotFoundException(
        `Unidad de medida con ID ${id} no encontrada`,
      );
    }

    // Check if new codigo already exists (if provided)
    if (
      updateUnidadMedidaDto.codigo &&
      updateUnidadMedidaDto.codigo !== unidadMedida.codigo
    ) {
      const existing = await this.unidadMedidaRepository.findOne({
        where: { codigo: updateUnidadMedidaDto.codigo },
      });
      if (existing) {
        throw new ConflictException(
          `Unidad de medida con código ${updateUnidadMedidaDto.codigo} ya existe`,
        );
      }
    }

    Object.assign(unidadMedida, updateUnidadMedidaDto);
    const result = await this.unidadMedidaRepository.save(unidadMedida);
    return this.mapToDto(result);
  }

  async remove(id: number): Promise<void> {
    const result = await this.unidadMedidaRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Unidad de medida con ID ${id} no encontrada`,
      );
    }
  }

  private mapToDto(entity: UnidadMedida): ResponseUnidadMedidaDto {
    return {
      id: entity.id,
      nombre: entity.nombre,
      codigo: entity.codigo,
      descripcion: entity.descripcion,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
