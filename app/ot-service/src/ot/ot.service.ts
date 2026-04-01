import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { OrdenTrabajo } from './entities/ot.entity';
import { CreateOrdenTrabajoDto } from './dto/create-orden-trabajo.dto';
import { UpdateOrdenTrabajoDto } from './dto/update-orden-trabajo.dto';

@Injectable()
export class OrdenTrabajoService {
  constructor(
    @Inject('OT_REPOSITORY')
    private readonly repo: Repository<OrdenTrabajo>,
  ) {}

  async create(dto: CreateOrdenTrabajoDto): Promise<OrdenTrabajo> {
    const ordenTrabajo = this.repo.create(dto);
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
    return this.repo.save(updated);
  }
  async remove(id: number): Promise<void> {
    const ordenTrabajo = await this.repo.findOne({ where: { id } });
    if (!ordenTrabajo) throw new Error('Orden de trabajo no encontrada');
    await this.repo.remove(ordenTrabajo);
  }
}
