import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Departamento } from './entities/departamento.entity';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';
import { ResponseDepartamentoDto } from './dto/response-departamento.dto';

@Injectable()
export class DepartamentoService {
  constructor(
    @Inject('DEPARTAMENTO_REPOSITORY')
    private readonly departamentoRepository: Repository<Departamento>,
  ) {}
  async create(dto: CreateDepartamentoDto): Promise<ResponseDepartamentoDto> {
    const entity = this.departamentoRepository.create({
      ...dto,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const saved = await this.departamentoRepository.save(entity);
    return this.toResponseDto(saved);
  }

  private toResponseDto(entity: Departamento): ResponseDepartamentoDto {
    return {
      id: entity.id,
      nombre: entity.nombre,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
  async findAll(): Promise<ResponseDepartamentoDto[]> {
    const list = await this.departamentoRepository.find();
    return list.map((entity) => this.toResponseDto(entity));
  }
  async findOne(id: number): Promise<ResponseDepartamentoDto> {
    const entity = await this.departamentoRepository.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Departamento not found');
    return this.toResponseDto(entity);
  }
  async update(
    id: number,
    dto: UpdateDepartamentoDto,
  ): Promise<ResponseDepartamentoDto> {
    const entity = await this.departamentoRepository.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Departamento not found');
    const updated = this.departamentoRepository.merge(entity, {
      ...dto,
      updatedAt: new Date(),
    });
    const saved = await this.departamentoRepository.save(updated);
    return this.toResponseDto(saved);
  }
  async remove(id: number): Promise<void> {
    const entity = await this.departamentoRepository.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Departamento not found');
    await this.departamentoRepository.remove(entity);
  }
}
