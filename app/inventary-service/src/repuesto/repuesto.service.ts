import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Repuesto } from './entities/repuesto.entity';
import { CreateRepuestoDto } from './dto/create-repuesto.dto';
import { UpdateRepuestoDto } from './dto/update-repuesto.dto';
import { ResponseRepuestoDto } from './dto/response-repuesto.dto';

@Injectable()
export class RepuestoService {
  constructor(
    @Inject('REPUESTO_REPOSITORY')
    private readonly repuestoRepository: Repository<Repuesto>,
  ) {}

  async create(dto: CreateRepuestoDto): Promise<ResponseRepuestoDto> {
    const repuesto = this.repuestoRepository.create({
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      uMedida: dto.uMedida,
      numeroDeParte: dto.numeroDeParte,
      ubicacion: dto.ubicacion,
      especificacion: dto.especificacion,
      costoUnitario: dto.costoUnitario,
      cantidad: dto.cantidad,
      stockCritico: dto.stockCritico,
      correlativo: dto.correlativo,
      costCenter: dto.centroCosto_id ? { id: dto.centroCosto_id } : undefined,
      process: dto.proceso_id ? { id: dto.proceso_id } : undefined,
      maquina: dto.maquina_id ? { id: dto.maquina_id } : undefined,
      subUnidad: dto.subUnidad_id ? { id: dto.subUnidad_id } : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const saved = await this.repuestoRepository.save(repuesto);
    return this.toResponseDto(saved);
  }

  async findAll(): Promise<ResponseRepuestoDto[]> {
    const list = await this.repuestoRepository.find({
      relations: ['costCenter', 'process', 'maquina', 'subUnidad'],
    });
    return list.map(this.toResponseDto);
  }

  async findOne(id: number): Promise<ResponseRepuestoDto> {
    const repuesto = await this.repuestoRepository.findOne({
      where: { id },
      relations: ['costCenter', 'process', 'maquina', 'subUnidad'],
    });
    if (!repuesto) throw new Error('Repuesto not found');
    return this.toResponseDto(repuesto);
  }

  async update(
    id: number,
    dto: UpdateRepuestoDto,
  ): Promise<ResponseRepuestoDto> {
    const repuesto = await this.repuestoRepository.findOne({ where: { id } });
    if (!repuesto) throw new Error('Repuesto not found');

    const updated = this.repuestoRepository.merge(repuesto, {
      nombre: dto.nombre ?? repuesto.nombre,
      descripcion: dto.descripcion ?? repuesto.descripcion,
      uMedida: dto.uMedida ?? repuesto.uMedida,
      numeroDeParte: dto.numeroDeParte ?? repuesto.numeroDeParte,
      ubicacion: dto.ubicacion ?? repuesto.ubicacion,
      especificacion: dto.especificacion ?? repuesto.especificacion,
      costoUnitario: dto.costoUnitario ?? repuesto.costoUnitario,
      cantidad: dto.cantidad ?? repuesto.cantidad,
      stockCritico: dto.stockCritico ?? repuesto.stockCritico,
      correlativo: dto.correlativo ?? repuesto.correlativo,
      costCenter: dto.centroCosto_id
        ? { id: dto.centroCosto_id }
        : repuesto.costCenter,
      process: dto.proceso_id ? { id: dto.proceso_id } : repuesto.process,
      maquina: dto.maquina_id ? { id: dto.maquina_id } : repuesto.maquina,
      subUnidad: dto.subUnidad_id
        ? { id: dto.subUnidad_id }
        : repuesto.subUnidad,
      updatedAt: new Date(),
    });

    const saved = await this.repuestoRepository.save(updated);
    return this.toResponseDto(saved);
  }

  async remove(id: number): Promise<void> {
    const repuesto = await this.repuestoRepository.findOne({ where: { id } });
    if (!repuesto) throw new Error('Repuesto not found');
    await this.repuestoRepository.remove(repuesto);
  }

  private toResponseDto = (r: Repuesto): ResponseRepuestoDto => ({
    id: r.id,
    nombre: r.nombre,
    descripcion: r.descripcion,
    uMedida: r.uMedida,
    numeroDeParte: r.numeroDeParte,
    ubicacion: r.ubicacion,
    especificacion: r.especificacion,
    costoUnitario: r.costoUnitario,
    cantidad: r.cantidad,
    stockCritico: r.stockCritico,
    correlativo: r.correlativo,
    centroCosto_id: r.costCenter?.id,
    proceso_id: r.process?.id,
    maquina_id: r.maquina?.id,
    subUnidad_id: r.subUnidad?.id,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  });
}
