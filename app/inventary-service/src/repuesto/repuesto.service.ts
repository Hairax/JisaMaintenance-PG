import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Repuesto } from './entities/repuesto.entity';
import { CompraDetalle } from '../compra/entities/compra-detalle.entity';
import { SalidaDetalle } from '../salida/entities/salida-detalle.entity';
import { CreateRepuestoDto } from './dto/create-repuesto.dto';
import { UpdateRepuestoDto } from './dto/update-repuesto.dto';
import { ResponseRepuestoDto } from './dto/response-repuesto.dto';

@Injectable()
export class RepuestoService {
  constructor(
    @Inject('REPUESTO_REPOSITORY')
    private readonly repuestoRepository: Repository<Repuesto>,
    @Inject('COMPRA_DETALLE_REPOSITORY')
    private readonly compraDetalleRepository: Repository<CompraDetalle>,
    @Inject('SALIDA_DETALLE_REPOSITORY')
    private readonly salidaDetalleRepository: Repository<SalidaDetalle>,
  ) {}

  async create(dto: CreateRepuestoDto): Promise<ResponseRepuestoDto> {
    const repuesto = this.repuestoRepository.create({
      tipo: dto.tipo,
      codigoPersonalizado: dto.codigoPersonalizado,
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      uMedida: dto.uMedida,
      almacen: dto.almacen,
      numeroDeParte: dto.numeroDeParte,
      ubicacion: dto.ubicacion,
      especificacion: dto.especificacion,
      costoUnitario: dto.costoUnitario,
      costoUnitarioPonderado: dto.costoUnitario,
      cantidad: dto.cantidad,
      aperturaCantidad: dto.cantidad,
      aperturaCostoUnitario: dto.costoUnitario,
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
      tipo: dto.tipo ?? repuesto.tipo,
      codigoPersonalizado:
        dto.codigoPersonalizado ?? repuesto.codigoPersonalizado,
      nombre: dto.nombre ?? repuesto.nombre,
      descripcion: dto.descripcion ?? repuesto.descripcion,
      uMedida: dto.uMedida ?? repuesto.uMedida,
      almacen: dto.almacen ?? repuesto.almacen,
      numeroDeParte: dto.numeroDeParte ?? repuesto.numeroDeParte,
      ubicacion: dto.ubicacion ?? repuesto.ubicacion,
      especificacion: dto.especificacion ?? repuesto.especificacion,
      costoUnitario: dto.costoUnitario ?? repuesto.costoUnitario,
      costoUnitarioPonderado: repuesto.costoUnitarioPonderado,
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

  async recalculateCostoPonderado(id: number): Promise<ResponseRepuestoDto> {
    const repuesto = await this.repuestoRepository.findOne({ where: { id } });
    if (!repuesto) throw new Error('Repuesto not found');

    const compras = await this.compraDetalleRepository
      .createQueryBuilder('detalle')
      .innerJoinAndSelect('detalle.compra', 'compra')
      .where('detalle.repuestoId = :id', { id })
      .orderBy('compra.fecha', 'ASC')
      .addOrderBy('detalle.id', 'ASC')
      .getMany();

    const salidas = await this.salidaDetalleRepository
      .createQueryBuilder('detalle')
      .innerJoinAndSelect('detalle.salida', 'salida')
      .where('detalle.repuestoId = :id', { id })
      .orderBy('salida.fecha', 'ASC')
      .addOrderBy('detalle.id', 'ASC')
      .getMany();

    type MovimientoConId = {
      tipo: 'COMPRA' | 'SALIDA';
      fecha: Date;
      cantidad: number;
      precioUnitario: number;
      salidaDetalleId?: number;
    };

    const movimientos: MovimientoConId[] = [
      // initial apertura (created stock) if present
      ...(repuesto.aperturaCantidad && Number(repuesto.aperturaCantidad) > 0
        ? [
            {
              tipo: 'COMPRA' as const,
              fecha: repuesto.createdAt || new Date(),
              cantidad: Number(repuesto.aperturaCantidad),
              precioUnitario: Number(repuesto.aperturaCostoUnitario) || 0,
            },
          ]
        : []),
      ...compras.map((detalle) => ({
        tipo: 'COMPRA' as const,
        fecha: detalle.compra.fecha,
        cantidad: Number(detalle.cantidad),
        precioUnitario: Number(detalle.precioUnitario),
      })),
      ...salidas.map((detalle) => ({
        tipo: 'SALIDA' as const,
        fecha: detalle.salida.fecha,
        cantidad: Number(detalle.cantidad),
        precioUnitario: 0,
        salidaDetalleId: detalle.id,
      })),
    ].sort((a, b) => {
      const fechaA = new Date(a.fecha).getTime();
      const fechaB = new Date(b.fecha).getTime();
      if (fechaA !== fechaB) return fechaA - fechaB;
      if (a.tipo === b.tipo) return 0;
      return a.tipo === 'COMPRA' ? -1 : 1;
    });

    let cantidadSaldo = 0;
    let costoPonderado = 0;
    const salidaCostos: Map<number, number> = new Map();

    // Procesar movimientos y registrar costo ponderado para cada salida
    for (const movimiento of movimientos) {
      if (movimiento.tipo === 'COMPRA' && movimiento.cantidad > 0) {
        const totalAnterior = cantidadSaldo * costoPonderado;
        const totalNuevo = movimiento.cantidad * movimiento.precioUnitario;
        cantidadSaldo += movimiento.cantidad;
        costoPonderado =
          cantidadSaldo > 0 ? (totalAnterior + totalNuevo) / cantidadSaldo : 0;
      }
      if (
        movimiento.tipo === 'SALIDA' &&
        movimiento.salidaDetalleId !== undefined
      ) {
        // Guardar el costo ponderado actual para esta salida
        salidaCostos.set(movimiento.salidaDetalleId, costoPonderado);
        cantidadSaldo -= movimiento.cantidad;
      }
    }

    // If there are no compras, but there was an apertura, use that aperturaCosto
    if (
      compras.length === 0 &&
      (!repuesto.aperturaCantidad || repuesto.aperturaCantidad == 0)
    ) {
      costoPonderado = Number(repuesto.costoUnitario) || 0;
    }

    // Actualizar todas las salidas con sus costos ponderados recalculados
    for (const salida of salidas) {
      const nuevoCosto = salidaCostos.get(salida.id);
      if (nuevoCosto !== undefined && nuevoCosto !== null) {
        salida.precioUnitario = Number(nuevoCosto.toFixed(4));
        salida.importe = Number(
          (Number(salida.cantidad) * nuevoCosto).toFixed(2),
        );
        salida.updatedAt = new Date();
      }
    }

    if (salidas.length > 0) {
      await this.salidaDetalleRepository.save(salidas);
    }

    repuesto.costoUnitarioPonderado = Number(costoPonderado.toFixed(4));
    repuesto.updatedAt = new Date();
    const saved = await this.repuestoRepository.save(repuesto);
    return this.toResponseDto(saved);
  }

  private toResponseDto = (r: Repuesto): ResponseRepuestoDto => ({
    id: r.id,
    tipo: r.tipo,
    codigoPersonalizado: r.codigoPersonalizado,
    nombre: r.nombre,
    descripcion: r.descripcion,
    uMedida: r.uMedida,
    almacen: r.almacen,
    numeroDeParte: r.numeroDeParte,
    ubicacion: r.ubicacion,
    especificacion: r.especificacion,
    costoUnitario: r.costoUnitario,
    costoUnitarioPonderado: r.costoUnitarioPonderado,
    aperturaCantidad: r.aperturaCantidad,
    aperturaCostoUnitario: r.aperturaCostoUnitario,
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
