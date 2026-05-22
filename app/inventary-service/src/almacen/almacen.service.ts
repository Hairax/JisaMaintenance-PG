import {
  Inject,
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Almacen } from './entities/almacen.entity';
import { CreateAlmacenDto } from './dto/create-almacen.dto';
import { UpdateAlmacenDto } from './dto/update-almacen.dto';
import { ResponseAlmacenDto } from './dto/response-almacen.dto';

@Injectable()
export class AlmacenService {
  constructor(
    @Inject('ALMACEN_REPOSITORY')
    private almacenRepository: Repository<Almacen>,
  ) {}

  async create(
    createAlmacenDto: CreateAlmacenDto,
  ): Promise<ResponseAlmacenDto> {
    // Check if codigo already exists
    const existing = await this.almacenRepository.findOne({
      where: { codigo: createAlmacenDto.codigo },
    });
    if (existing) {
      throw new ConflictException(
        `Almacén con código ${createAlmacenDto.codigo} ya existe`,
      );
    }

    const almacen = this.almacenRepository.create(createAlmacenDto);
    const result = await this.almacenRepository.save(almacen);
    return this.mapToDto(result);
  }

  async findAll(): Promise<ResponseAlmacenDto[]> {
    const almacenes = await this.almacenRepository.find({
      order: { nombre: 'ASC' },
    });
    return almacenes.map((a) => this.mapToDto(a));
  }

  async findOne(id: number): Promise<ResponseAlmacenDto> {
    const almacen = await this.almacenRepository.findOne({
      where: { id },
    });
    if (!almacen) {
      throw new NotFoundException(`Almacén con ID ${id} no encontrado`);
    }
    return this.mapToDto(almacen);
  }

  async update(
    id: number,
    updateAlmacenDto: UpdateAlmacenDto,
  ): Promise<ResponseAlmacenDto> {
    const almacen = await this.almacenRepository.findOne({
      where: { id },
    });
    if (!almacen) {
      throw new NotFoundException(`Almacén con ID ${id} no encontrado`);
    }

    // Check if new codigo already exists (if provided)
    if (updateAlmacenDto.codigo && updateAlmacenDto.codigo !== almacen.codigo) {
      const existing = await this.almacenRepository.findOne({
        where: { codigo: updateAlmacenDto.codigo },
      });
      if (existing) {
        throw new ConflictException(
          `Almacén con código ${updateAlmacenDto.codigo} ya existe`,
        );
      }
    }

    Object.assign(almacen, updateAlmacenDto);
    const result = await this.almacenRepository.save(almacen);
    return this.mapToDto(result);
  }

  async remove(id: number): Promise<void> {
    const result = await this.almacenRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Almacén con ID ${id} no encontrado`);
    }
  }

  private mapToDto(entity: Almacen): ResponseAlmacenDto {
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
