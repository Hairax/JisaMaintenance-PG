import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Compra } from './entities/compra.entity';
import { CompraDetalle } from './entities/compra-detalle.entity';
import { Repuesto } from '../repuesto/entities/repuesto.entity';
import { CreateCompraDto } from './dto/create-compra.dto';
import { UpdateCompraDto } from './dto/update-compra.dto';
import { ResponseCompraDto } from './dto/response-compra.dto';
import { RepuestoService } from '../repuesto/repuesto.service';

@Injectable()
export class CompraService {
  constructor(
    @Inject('COMPRA_REPOSITORY')
    private compraRepository: Repository<Compra>,
    @Inject('COMPRA_DETALLE_REPOSITORY')
    private compraDetalleRepository: Repository<CompraDetalle>,
    @Inject('REPUESTO_REPOSITORY')
    private repuestoRepository: Repository<Repuesto>,
    private repuestoService: RepuestoService,
  ) {}

  // ── helpers ────────────────────────────────────────────────────────────────
  private calcDetalles(detalles: CreateCompraDto['detalles']) {
    let subtotal = 0;
    let descuentoTotal = 0;
    const calculated = detalles.map((d) => {
      const precioBruto = Number(d.precioUnitario);
      const porcentajeImpuesto = d.porcentajeImpuesto || 13;
      // Calcular precio sin impuesto: precio - (precio * porcentaje)
      const precioSinImpuesto =
        porcentajeImpuesto > 0
          ? precioBruto - precioBruto * (porcentajeImpuesto / 100)
          : precioBruto;

      const importe = Number(d.cantidad) * precioSinImpuesto;
      const descuento = (importe * (d.porcentajeDescuento || 0)) / 100;
      subtotal += Number(d.cantidad) * precioBruto; // Total con impuesto
      descuentoTotal += descuento;
      return {
        ...d,
        precioUnitario: precioSinImpuesto, // Guardar precio sin impuesto
        precioOriginal: precioBruto, // Precio tal cual factura, con impuesto
        importe,
        descuentoMonto: descuento,
        subtotal: importe - descuento,
        porcentajeImpuesto,
      };
    });
    return {
      calculated,
      subtotal,
      descuentoTotal,
      total: subtotal - descuentoTotal,
    };
  }

  private async incrementStock(
    detalles: {
      repuestoId?: number;
      cantidad: number;
      precioUnitario?: number;
    }[],
    sign: 1 | -1,
  ) {
    for (const d of detalles) {
      if (!d.repuestoId) continue;
      const rep = await this.repuestoRepository.findOne({
        where: { id: d.repuestoId },
      });
      if (!rep) continue;

      const cantidadAnterior = Number(rep.cantidad);
      const cantidadNueva = sign * Number(d.cantidad);
      const costoAnterior = Number(rep.costoUnitario) || 0;
      const costoNuevo = Number(d.precioUnitario) || 0;

      // Actualizar cantidad
      rep.cantidad = cantidadAnterior + cantidadNueva;

      // Calcular costo promedio ponderado solo en entradas (sign = 1)
      // Fórmula: ((cantidadActual * costoActual) + (cantidadNueva * costoNuevo)) / (cantidadActual + cantidadNueva)
      if (sign === 1 && cantidadNueva > 0 && costoNuevo > 0) {
        const cantidadTotal = cantidadAnterior + cantidadNueva;
        if (cantidadTotal > 0) {
          const totalAnterior = cantidadAnterior * costoAnterior;
          const totalNuevo = cantidadNueva * costoNuevo;
          rep.costoUnitarioPonderado =
            (totalAnterior + totalNuevo) / cantidadTotal;
          if (!rep.costoUnitario) {
            rep.costoUnitario = costoNuevo;
          }
        }
      }

      rep.updatedAt = new Date();
      await this.repuestoRepository.save(rep);
    }
  }

  // Recalcula el costo ponderado (kardex completo, por fecha) de cada
  // repuesto; esto también reprecia sus salidas y actualiza sus totales.
  private async recalcularRepuestos(repuestoIds: Iterable<number>) {
    for (const repuestoId of new Set(repuestoIds)) {
      try {
        await this.repuestoService.recalculateCostoPonderado(repuestoId);
      } catch (error) {
        console.error(
          `Error recalculando costo ponderado para repuesto ${repuestoId}:`,
          error,
        );
      }
    }
  }

  private idsRepuestos(detalles: { repuestoId?: number | null }[] = []) {
    return detalles.map((d) => d.repuestoId).filter((id): id is number => !!id);
  }

  // ── create ─────────────────────────────────────────────────────────────────
  async create(dto: CreateCompraDto): Promise<ResponseCompraDto> {
    const { detalles, ...compraData } = dto;
    const { calculated, subtotal, descuentoTotal, total } =
      this.calcDetalles(detalles);

    const compra = this.compraRepository.create({
      ...compraData,
      subtotal,
      descuentoTotal,
      total,
      createdAt: new Date(),
      updatedAt: new Date(),
      detalles: [],
    });
    const savedCompra = await this.compraRepository.save(compra);

    const detalleEntities = calculated.map((d) =>
      this.compraDetalleRepository.create({
        compraId: savedCompra.id,
        ...d,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
    const savedDetalles =
      await this.compraDetalleRepository.save(detalleEntities);

    // Update repuesto stock (+)
    await this.incrementStock(calculated, 1);
    // El ponderado incremental de incrementStock no contempla compras con
    // fecha anterior a salidas existentes: se recalcula con el kardex.
    await this.recalcularRepuestos(this.idsRepuestos(calculated));

    return this.toResponseDto(savedCompra, savedDetalles);
  }

  // ── findAll / findOne ──────────────────────────────────────────────────────
  async findAll(): Promise<Compra[]> {
    return this.compraRepository.find({ relations: ['proveedor', 'detalles'] });
  }

  async findOne(id: number): Promise<Compra> {
    const compra = await this.compraRepository.findOne({
      where: { id },
      relations: ['proveedor', 'detalles'],
    });
    if (!compra) throw new Error('Compra not found');
    return compra;
  }

  // ── update ─────────────────────────────────────────────────────────────────
  async update(id: number, dto: UpdateCompraDto): Promise<ResponseCompraDto> {
    const compra = await this.findOne(id);

    // Solo se reemplazan los detalles si el request los trae. Un update de
    // solo cabecera (sin `detalles`) no debe revertir stock ni borrarlos.
    const reemplazaDetalles = dto.detalles !== undefined;
    const repuestosAfectados = new Set<number>();

    if (reemplazaDetalles) {
      // Repuestos que se quitan de la compra también cambian su kardex.
      for (const repuestoId of this.idsRepuestos(compra.detalles)) {
        repuestosAfectados.add(repuestoId);
      }
      // Reverse old detalles stock
      if (compra.detalles?.length) {
        await this.incrementStock(compra.detalles, -1);
      }

      // Hard-delete old detalles via QueryBuilder (bypasses TypeORM cascade)
      await this.compraDetalleRepository
        .createQueryBuilder()
        .delete()
        .where('compraId = :compraId', { compraId: id })
        .execute();
    }

    // Update header fields using repository.update() — no cascade, no save()
    const { detalles, ...headerFields } = dto;
    let savedDetalles: CompraDetalle[] = [];

    if (detalles?.length) {
      const { calculated, subtotal, descuentoTotal, total } =
        this.calcDetalles(detalles);

      // Plain SQL UPDATE on compra row — zero cascade
      await this.compraRepository.update(id, {
        ...headerFields,
        subtotal,
        descuentoTotal,
        total,
        updatedAt: new Date(),
      });

      const entities = calculated.map((d) =>
        this.compraDetalleRepository.create({
          compraId: id,
          ...d,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );
      savedDetalles = await this.compraDetalleRepository.save(entities);

      // Collect affected repuestos for later recalculation
      for (const d of calculated) {
        if (d.repuestoId) {
          repuestosAfectados.add(d.repuestoId);
        }
      }

      // Apply new stock (+)
      await this.incrementStock(calculated, 1);
    } else {
      await this.compraRepository.update(id, {
        ...headerFields,
        updatedAt: new Date(),
      });
      // Si cambió la fecha, el orden del kardex cambia: recalcular los
      // repuestos de los detalles que se conservan.
      if (!reemplazaDetalles && headerFields.fecha) {
        for (const d of compra.detalles ?? []) {
          if (d.repuestoId) repuestosAfectados.add(d.repuestoId);
        }
      }
    }

    // Recalculate costos ponderados y actualizar salidas para cada repuesto afectado
    await this.recalcularRepuestos(repuestosAfectados);

    const updated = await this.findOne(id);
    return this.toResponseDto(updated, updated.detalles ?? savedDetalles);
  }

  // ── remove ─────────────────────────────────────────────────────────────────
  async remove(id: number): Promise<void> {
    const compra = await this.findOne(id);
    // Reverse stock before removing
    if (compra.detalles?.length) {
      await this.incrementStock(compra.detalles, -1);
    }
    await this.compraRepository.remove(compra);
    await this.recalcularRepuestos(this.idsRepuestos(compra.detalles));
  }

  // ── toResponseDto ──────────────────────────────────────────────────────────
  private toResponseDto(
    compra: Compra,
    detalles: CompraDetalle[],
  ): ResponseCompraDto {
    return {
      id: compra.id,
      nroDocumento: compra.nroDocumento,
      tipoDocumento: compra.tipoDocumento,
      nroFactura: compra.nroFactura,
      nit: compra.nit,
      proveedorId: compra.proveedorId,
      detalle: compra.detalle,
      almacen: compra.almacen,
      fecha: compra.fecha,
      tipoCambio: compra.tipoCambio,
      nroAutorizacion: compra.nroAutorizacion,
      usuarioId: compra.usuarioId,
      subtotal: compra.subtotal,
      descuentoTotal: compra.descuentoTotal,
      total: compra.total,
      detalles,
      createdAt: compra.createdAt,
      updatedAt: compra.updatedAt,
    };
  }
}
