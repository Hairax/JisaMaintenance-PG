import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Maquina } from './entities/maquina.entity';
import { CreateMaquinaDto } from './dto/create-maquina.dtop';
import { UpdateMaquinaDto } from './dto/update-maquina.dtop';
import { ResponseMaquinaDto } from './dto/response-maquina.dtop';

@Injectable()
export class MaquinaService {
  constructor(
    @Inject('MAQUINA_REPOSITORY')
    private maquinaRepository: Repository<Maquina>,
  ) {}

  async create(dto: CreateMaquinaDto): Promise<ResponseMaquinaDto> {
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
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const saved = await this.maquinaRepository.save(maquina);
    return this.toResponseDto(saved);
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
    const maquina = await this.maquinaRepository.findOne({ where: { id } });
    if (!maquina) throw new Error('Maquina not found');

    const updated = this.maquinaRepository.merge(maquina, {
      ...dto,
      costCenter: dto.centroCosto_id
        ? { id: dto.centroCosto_id }
        : maquina.costCenter,
      process: dto.proceso_id ? { id: dto.proceso_id } : maquina.process,
      proveedor: dto.proveedor_id
        ? { id: dto.proveedor_id }
        : maquina.proveedor,
      updatedAt: new Date(),
    });

    const saved = await this.maquinaRepository.save(updated);
    return this.toResponseDto(saved);
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
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  });
}
