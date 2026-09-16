import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { OrdenTrabajo } from './entities/ot.entity';
import { CreateOrdenTrabajoDto } from './dto/create-orden-trabajo.dto';
import { UpdateOrdenTrabajoDto } from './dto/update-orden-trabajo.dto';

@Injectable()
export class OrdenTrabajoService implements OnModuleInit {
  private readonly logger = new Logger(OrdenTrabajoService.name);

  constructor(
    @Inject('OT_REPOSITORY')
    private readonly repo: Repository<OrdenTrabajo>,
  ) {}

  // Backfill único (idempotente): las OT que ya estaban 'Cerrada' antes de
  // que existiera esta columna no tienen fechaCierre. Les asignamos su
  // fechaCreacion como aproximación, para que no queden invisibles en el
  // reporte de cierre mensual. No hace nada en arranques posteriores, una
  // vez que ya no quedan filas sin fechaCierre.
  async onModuleInit() {
    try {
      const result = await this.repo
        .createQueryBuilder()
        .update(OrdenTrabajo)
        .set({ fechaCierre: () => 'fechaCreacion' })
        .where('estado = :estado AND fechaCierre IS NULL', {
          estado: 'Cerrada',
        })
        .execute();
      if (result.affected) {
        this.logger.log(
          `Backfill de fechaCierre: ${result.affected} OT(s) cerradas actualizadas con su fechaCreacion.`,
        );
      }
    } catch (err) {
      this.logger.error('Error en backfill de fechaCierre', err);
    }
  }

  async create(dto: CreateOrdenTrabajoDto): Promise<OrdenTrabajo> {
    const ordenTrabajo = this.repo.create({
      ...dto,
      fechaCierre: dto.estado === 'Cerrada' ? new Date() : null,
    });
    return this.repo.save(ordenTrabajo);
  }
  async findAll(): Promise<OrdenTrabajo[]> {
    return this.repo.find({
      relations: [
        'tipoOT',
        'costCenter',
        'proceso',
        'maquina',
        'supervisor',
        'departamento',
        'objeto',
        'subUnidad',
      ],
    });
  }
  async findOne(id: number): Promise<OrdenTrabajo> {
    const ordenTrabajo = await this.repo.findOne({
      where: { id },
      relations: [
        'tipoOT',
        'costCenter',
        'proceso',
        'maquina',
        'supervisor',
        'departamento',
        'objeto',
        'subUnidad',
      ],
    });
    if (!ordenTrabajo) throw new Error('Orden de trabajo no encontrada');
    return ordenTrabajo;
  }
  async update(id: number, dto: UpdateOrdenTrabajoDto): Promise<OrdenTrabajo> {
    const ordenTrabajo = await this.repo.findOne({ where: { id } });
    if (!ordenTrabajo) throw new Error('Orden de trabajo no encontrada');

    const updated = this.repo.merge(ordenTrabajo, dto);

    // Estampar/limpiar fechaCierre según el nuevo estado, no según lo que
    // haya venido en el dto (para que ningún caller tenga que acordarse de
    // mandarla a mano).
    if (dto.estado !== undefined) {
      if (dto.estado === 'Cerrada' && !ordenTrabajo.fechaCierre) {
        updated.fechaCierre = new Date();
      } else if (dto.estado !== 'Cerrada') {
        updated.fechaCierre = null;
      }
    }

    return this.repo.save(updated);
  }
  async remove(id: number): Promise<void> {
    const ordenTrabajo = await this.repo.findOne({ where: { id } });
    if (!ordenTrabajo) throw new Error('Orden de trabajo no encontrada');
    await this.repo.remove(ordenTrabajo);
  }
}
