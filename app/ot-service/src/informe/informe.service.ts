import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Informe } from './entities/informe.entity';
import { InformeDetalle } from './entities/informe-detalle.entity';
import { CreateInformeDto } from './dto/create-informe.dto';
import { UpdateInformeDto } from './dto/update-informe.dto';

@Injectable()
export class InformeService {
  constructor(
    @Inject('INFORME_REPOSITORY')
    private readonly informeRepo: Repository<Informe>,
    @Inject('INFORME_DETALLE_REPOSITORY')
    private readonly detalleRepo: Repository<InformeDetalle>,
  ) {}

  // CRUD para Informe
  async create(dto: CreateInformeDto): Promise<Informe> {
    const informe = this.informeRepo.create({
      userId: dto.userId,
      detalles: dto.detalles.map((d) =>
        this.detalleRepo.create({
          otId: d.otId,
          observaciones: d.observaciones,
          horaInicio: d.horaInicio,
          horaFinalización: d.horaFinalización,
        }),
      ),
    });
    return this.informeRepo.save(informe);
  }

  findAll(): Promise<Informe[]> {
    return this.informeRepo.find({ relations: ['detalles'] });
  }

  findOne(id: number): Promise<Informe | null> {
    return this.informeRepo.findOne({
      where: { id },
      relations: ['detalles'],
    });
  }

  async update(id: number, dto: UpdateInformeDto): Promise<Informe> {
    const informe = await this.findOne(id);
    if (!informe) {
      throw new NotFoundException(`Informe with id ${id} not found`);
    }

    if (dto.userId !== undefined) {
      informe.userId = dto.userId;
    }

    if (dto.detalles !== undefined) {
      // Delete existing detalles and create new ones
      if (informe.detalles && informe.detalles.length > 0) {
        await this.detalleRepo.remove(informe.detalles);
      }
      informe.detalles = dto.detalles.map((d) =>
        this.detalleRepo.create({
          otId: d.otId,
          observaciones: d.observaciones,
          horaInicio: d.horaInicio,
          horaFinalización: d.horaFinalización,
        }),
      );
    }

    return this.informeRepo.save(informe);
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    const result = await this.informeRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Informe with id ${id} not found`);
    }
    return { deleted: true };
  }
}
