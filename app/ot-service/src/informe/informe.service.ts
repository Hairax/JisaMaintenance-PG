import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InformeDiarioTrabajo } from './entities/informeDiarioTrabajo.entity';
import { InformeDetalleTrabajo } from './entities/informeDetalleTrabajo.entity';
import { CreateInformeDiarioTrabajoDto } from './dto/create-informe-diario-trabajo.dto';
import { UpdateInformeDiarioTrabajoDto } from './dto/update-informe-diario-trabajo.dto';
import { CreateInformeDetalleTrabajoDto } from './dto/create-informe-detalle-trabajo.dto';
import { UpdateInformeDetalleTrabajoDto } from './dto/update-informe-detalle-trabajo.dto';

@Injectable()
export class InformeService {
  constructor(
    @Inject('DIARIO_REPOSITORY')
    private readonly diarioRepo: Repository<InformeDiarioTrabajo>,
    @Inject('DETALLE_REPOSITORY')
    private readonly detalleRepo: Repository<InformeDetalleTrabajo>,
  ) {}

  // CRUD para InformeDiarioTrabajo
  createDiario(dto: CreateInformeDiarioTrabajoDto) {
    return this.diarioRepo.save(dto);
  }
  findAllDiario() {
    return this.diarioRepo.find();
  }
  findOneDiario(id: number) {
    return this.diarioRepo.findOneBy({ id });
  }
  async updateDiario(id: number, dto: UpdateInformeDiarioTrabajoDto) {
    await this.diarioRepo.update(id, dto);
    return this.findOneDiario(id);
  }
  async removeDiario(id: number) {
    const result = await this.diarioRepo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException('Informe diario no encontrado');
    return { deleted: true };
  }

  // CRUD para InformeDetalleTrabajo
  createDetalle(dto: CreateInformeDetalleTrabajoDto) {
    return this.detalleRepo.save(dto);
  }
  findAllDetalle() {
    return this.detalleRepo.find();
  }
  findOneDetalle(id: number) {
    return this.detalleRepo.findOneBy({ id });
  }
  async updateDetalle(id: number, dto: UpdateInformeDetalleTrabajoDto) {
    await this.detalleRepo.update(id, dto);
    return this.findOneDetalle(id);
  }
  async removeDetalle(id: number) {
    const result = await this.detalleRepo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException('Detalle de informe no encontrado');
    return { deleted: true };
  }
}
