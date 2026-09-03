import { Injectable, Inject } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { Process } from './entities/process.entity';
import { CreateProcessDto } from './dto/create-process.dto';
import { UpdateProcessDto } from './dto/update-process.dto';
import { ResponseProcessDto } from './dto/response-process.dto';
import { runWithDuplicateRetry } from '../common/concurrency.util';

@Injectable()
export class ProcessService {
  constructor(
    @Inject('PROCESS_REPOSITORY')
    private processRepository: Repository<Process>,
  ) {}

  // Lockea los procesos existentes del centro de costo mientras calcula el
  // próximo correlativo, para que una segunda transacción concurrente
  // espere a que esta termine en vez de leer el mismo "último" valor.
  private async getNextCorrelativo(
    manager: EntityManager,
    centroCostoId: number,
  ): Promise<number> {
    const latest = await manager.findOne(Process, {
      where: { costCenter: { id: centroCostoId } },
      order: { correlativo: 'DESC' },
      lock: { mode: 'pessimistic_write' },
    });
    return latest?.correlativo ? latest.correlativo + 1 : 1;
  }

  async create(dto: CreateProcessDto): Promise<ResponseProcessDto> {
    if (dto.correlativo != null && dto.correlativo > 0) {
      const process = this.processRepository.create({
        name: dto.name,
        costCenter: { id: dto.centroCosto_id },
        correlativo: dto.correlativo,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const saved = await this.processRepository.save(process);
      return {
        id: saved.id,
        name: saved.name,
        centroCosto: saved.costCenter.id,
        correlativo: saved.correlativo,
        createdAt: saved.createdAt,
        updatedAt: saved.updatedAt,
      };
    }

    return runWithDuplicateRetry(() =>
      this.processRepository.manager.transaction(async (manager) => {
        const correlativo = await this.getNextCorrelativo(
          manager,
          dto.centroCosto_id,
        );
        const process = manager.create(Process, {
          name: dto.name,
          costCenter: { id: dto.centroCosto_id },
          correlativo,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        const saved = await manager.save(process);
        return {
          id: saved.id,
          name: saved.name,
          centroCosto: saved.costCenter.id,
          correlativo: saved.correlativo,
          createdAt: saved.createdAt,
          updatedAt: saved.updatedAt,
        };
      }),
    );
  }

  async findAll(): Promise<ResponseProcessDto[]> {
    const list = await this.processRepository.find({
      relations: ['costCenter'],
    });
    return list.map((p) => ({
      id: p.id,
      name: p.name,
      centroCosto: p.costCenter.id,
      correlativo: p.correlativo,
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
      correlativo: process.correlativo,
      createdAt: process.createdAt,
      updatedAt: process.updatedAt,
    };
  }

  async update(id: number, dto: UpdateProcessDto): Promise<Process> {
    return runWithDuplicateRetry(() =>
      this.processRepository.manager.transaction(async (manager) => {
        const process = await manager.findOne(Process, {
          where: { id },
          relations: ['costCenter'],
        });
        if (!process) throw new Error('Process not found');

        const correlativo =
          dto.correlativo != null
            ? dto.correlativo
            : dto.centroCosto_id && dto.centroCosto_id !== process.costCenter.id
              ? await this.getNextCorrelativo(manager, dto.centroCosto_id)
              : process.correlativo;

        const updated = manager.merge(Process, process, {
          name: dto.name ?? process.name,
          costCenter: dto.centroCosto_id
            ? { id: dto.centroCosto_id }
            : process.costCenter,
          correlativo,
          updatedAt: new Date(),
        });
        return await manager.save(updated);
      }),
    );
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
