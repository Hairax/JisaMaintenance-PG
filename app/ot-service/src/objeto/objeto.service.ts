import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Objeto } from './entities/objeto.entity';
import { CreateObjetoDto } from './dto/create-objeto.dto';
import { UpdateObjetoDto } from './dto/update-objeto.dto';
import { ResponseObjetoDto } from './dto/response-objeto.dto';

@Injectable()
export class ObjetoService {
  constructor(
    @Inject('OBJETO_REPOSITORY')
    private readonly objetoRepository: Repository<Objeto>,
  ) {}

  async create(dto: CreateObjetoDto): Promise<ResponseObjetoDto> {
    const entity = this.objetoRepository.create({
      ...dto,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const saved = await this.objetoRepository.save(entity);
    return this.toResponseDto(saved);
  }

  private toResponseDto(entity: Objeto): ResponseObjetoDto {
    return {
      id: entity.id,
      nombre: entity.nombre,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  async findAll(): Promise<ResponseObjetoDto[]> {
    const list = await this.objetoRepository.find();
    return list.map((entity) => this.toResponseDto(entity));
  }

  async findOne(id: number): Promise<ResponseObjetoDto> {
    const entity = await this.objetoRepository.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Objeto not found');
    return this.toResponseDto(entity);
  }

  async update(id: number, dto: UpdateObjetoDto): Promise<ResponseObjetoDto> {
    const entity = await this.objetoRepository.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Objeto not found');
    const updated = this.objetoRepository.merge(entity, {
      ...dto,
      updatedAt: new Date(),
    });
    const saved = await this.objetoRepository.save(updated);
    return this.toResponseDto(saved);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.objetoRepository.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Objeto not found');
    await this.objetoRepository.remove(entity);
  }
}
