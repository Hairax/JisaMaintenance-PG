import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Process } from './entities/process.entity';
import { CreateProcessDto } from './dto/create-process.dto';
import { UpdateProcessDto } from './dto/update-process.dto';
import { ResponseProcessDto } from './dto/response-process.dto';

@Injectable()
export class ProcessService {
  constructor(
    @Inject('PROCESS_REPOSITORY')
    private processRepository: Repository<Process>,
  ) {}

  async create(dto: CreateProcessDto): Promise<ResponseProcessDto> {
    const process = this.processRepository.create({
      name: dto.name,
      costCenter: { id: dto.centroCosto_id },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const saved = await this.processRepository.save(process);
    return {
      id: saved.id,
      name: saved.name,
      centroCosto: saved.costCenter.id,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }

  async findAll(): Promise<ResponseProcessDto[]> {
    const list = await this.processRepository.find({
      relations: ['costCenter'],
    });
    return list.map((p) => ({
      id: p.id,
      name: p.name,
      centroCosto: p.costCenter.id,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  }

  async findOne(id: number): Promise<ResponseProcessDto> {
    const process = await this.processRepository.findOne({
      where: { id },
      relations: ['costCenter'],
    });
    if (!process) throw new Error('Process not found');
    return {
      id: process.id,
      name: process.name,
      centroCosto: process.costCenter.id,
      createdAt: process.createdAt,
      updatedAt: process.updatedAt,
    };
  }

  async update(id: number, dto: UpdateProcessDto): Promise<Process> {
    const process = await this.processRepository.findOne({
      where: { id },
      relations: ['costCenter'],
    });
    if (!process) throw new Error('Process not found');
    const updated = this.processRepository.merge(process, {
      name: dto.name ?? process.name,
      costCenter: dto.centroCosto_id
        ? { id: dto.centroCosto_id }
        : process.costCenter,
      updatedAt: new Date(),
    });
    return await this.processRepository.save(updated);
  }

  async remove(id: number): Promise<void> {
    const process = await this.processRepository.findOne({
      where: { id },
      relations: ['costCenter'],
    });
    if (!process) throw new Error('Process not found');
    await this.processRepository.remove(process);
  }
}
