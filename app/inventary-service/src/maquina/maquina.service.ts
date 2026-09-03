import { Inject, Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { Maquina } from './entities/maquina.entity';
import { CreateMaquinaDto } from './dto/create-maquina.dtop';
import { UpdateMaquinaDto } from './dto/update-maquina.dtop';
import { ResponseMaquinaDto } from './dto/response-maquina.dtop';
import { runWithDuplicateRetry } from '../common/concurrency.util';

@Injectable()
export class MaquinaService {
  constructor(
    @Inject('MAQUINA_REPOSITORY')
    private maquinaRepository: Repository<Maquina>,
  ) {}

  // Lockea las máquinas existentes del proceso mientras calcula el próximo
  // correlativo, para que una segunda transacción concurrente espere a que
  // esta termine en vez de leer el mismo "último" valor y duplicarlo.
  private async getNextCorrelativo(
    manager: EntityManager,
    procesoId: number,
  ): Promise<number> {
    const latest = await manager.findOne(Maquina, {
      where: { process: { id: procesoId } },
      order: { correlativo: 'DESC' },
      lock: { mode: 'pessimistic_write' },
    });
    return latest?.correlativo && latest.correlativo > 0
      ? latest.correlativo + 1
      : 1;
  }

  private async assertCorrelativoUnique(
    procesoId: number,
    correlativo: number,
    excludeId?: number,
  ) {
    if (!correlativo || correlativo <= 0) return;
    const existing = await this.maquinaRepository.findOne({
      where: { process: { id: procesoId }, correlativo },
    });
    if (existing && existing.id !== excludeId) {
      throw new Error(
        `El correlativo ${correlativo} ya existe para el proceso ${procesoId}`,
      );
    }
  }

  async create(dto: CreateMaquinaDto): Promise<ResponseMaquinaDto> {
    if (dto.correlativo != null && dto.correlativo > 0) {
      await this.assertCorrelativoUnique(dto.proceso_id, dto.correlativo);
      const maquina = this.maquinaRepository.create({
        name: dto.name,
        fabricante: dto.fabricante,
        tipoDeMaquina: dto.tipoDeMaquina,
        numeroDeSerie: dto.numeroDeSerie,
        fechaDeFabricacion: dto.fechaDeFabricacion,
        fechaDeMontaje: dto.fechaDeMontaje,
        costo: dto.costo,
        horasTrabajadas: dto.horasTrabajadas,
        costCenter: { id: dto.centroCosto_id },
        process: { id: dto.proceso_id },
        proveedor: { id: dto.proveedor_id },
        correlativo: dto.correlativo,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const saved = await this.maquinaRepository.save(maquina);
      return this.toResponseDto(saved);
    }

    return runWithDuplicateRetry(() =>
      this.maquinaRepository.manager.transaction(async (manager) => {
        const correlativo = await this.getNextCorrelativo(
          manager,
          dto.proceso_id,
        );
        const maquina = manager.create(Maquina, {
          name: dto.name,
          fabricante: dto.fabricante,
          tipoDeMaquina: dto.tipoDeMaquina,
          numeroDeSerie: dto.numeroDeSerie,
          fechaDeFabricacion: dto.fechaDeFabricacion,
          fechaDeMontaje: dto.fechaDeMontaje,
          costo: dto.costo,
          horasTrabajadas: dto.horasTrabajadas,
          costCenter: { id: dto.centroCosto_id },
          process: { id: dto.proceso_id },
          proveedor: { id: dto.proveedor_id },
          correlativo,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        const saved = await manager.save(maquina);
        return this.toResponseDto(saved);
      }),
    );
  }

  async findAll(): Promise<ResponseMaquinaDto[]> {
    const list = await this.maquinaRepository.find({
      relations: ['costCenter', 'process', 'proveedor'],
    });
    return list.map(this.toResponseDto);
  }

  async findOne(id: number): Promise<ResponseMaquinaDto> {
    const maquina = await this.maquinaRepository.findOne({
      where: { id },
      relations: ['costCenter', 'process', 'proveedor'],
    });
    if (!maquina) throw new Error('Maquina not found');
    return this.toResponseDto(maquina);
  }

  async update(id: number, dto: UpdateMaquinaDto): Promise<ResponseMaquinaDto> {
    return runWithDuplicateRetry(() =>
      this.maquinaRepository.manager.transaction(async (manager) => {
        const maquina = await manager.findOne(Maquina, {
          where: { id },
          relations: ['costCenter', 'process', 'proveedor'],
        });
        if (!maquina) throw new Error('Maquina not found');

        const targetProcesoId = dto.proceso_id ?? maquina.process?.id;

        const correlativo =
          dto.correlativo != null && dto.correlativo > 0
            ? dto.correlativo
            : dto.proceso_id && dto.proceso_id !== maquina.process?.id
              ? await this.getNextCorrelativo(manager, dto.proceso_id)
              : maquina.correlativo;

        if (dto.correlativo != null && dto.correlativo > 0) {
          await this.assertCorrelativoUnique(
            targetProcesoId,
            dto.correlativo,
            id,
          );
        }

        const updated = manager.merge(Maquina, maquina, {
          name: dto.name ?? maquina.name,
          fabricante: dto.fabricante ?? maquina.fabricante,
          tipoDeMaquina: dto.tipoDeMaquina ?? maquina.tipoDeMaquina,
          numeroDeSerie: dto.numeroDeSerie ?? maquina.numeroDeSerie,
          fechaDeFabricacion:
            dto.fechaDeFabricacion ?? maquina.fechaDeFabricacion,
          fechaDeMontaje: dto.fechaDeMontaje ?? maquina.fechaDeMontaje,
          costo: dto.costo ?? maquina.costo,
          horasTrabajadas: dto.horasTrabajadas ?? maquina.horasTrabajadas,
          costCenter: dto.centroCosto_id
            ? { id: dto.centroCosto_id }
            : maquina.costCenter,
          process: dto.proceso_id ? { id: dto.proceso_id } : maquina.process,
          proveedor: dto.proveedor_id
            ? { id: dto.proveedor_id }
            : maquina.proveedor,
          correlativo,
          updatedAt: new Date(),
        });

        const saved = await manager.save(updated);
        return this.toResponseDto(saved);
      }),
    );
  }

  async remove(id: number): Promise<void> {
    const maquina = await this.maquinaRepository.findOne({ where: { id } });
    if (!maquina) throw new Error('Maquina not found');
    await this.maquinaRepository.remove(maquina);
  }

  private toResponseDto = (m: Maquina): ResponseMaquinaDto => ({
    id: m.id,
    name: m.name,
    fabricante: m.fabricante,
    tipoDeMaquina: m.tipoDeMaquina,
    numeroDeSerie: m.numeroDeSerie,
    fechaDeFabricacion: m.fechaDeFabricacion,
    fechaDeMontaje: m.fechaDeMontaje,
    costo: m.costo,
    horasTrabajadas: m.horasTrabajadas,
    centroCosto_id: m.costCenter?.id,
    proceso_id: m.process?.id,
    proveedor_id: m.proveedor?.id,
    correlativo: m.correlativo,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  });
}
