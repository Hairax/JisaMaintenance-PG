import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Compra } from './entities/compra.entity';
import { CompraDetalle } from './entities/compra-detalle.entity';
import { Repuesto } from '../repuesto/entities/repuesto.entity';
import { CreateCompraDto } from './dto/create-compra.dto';
import { UpdateCompraDto } from './dto/update-compra.dto';
import { ResponseCompraDto } from './dto/response-compra.dto';

@Injectable()
export class CompraService {
  constructor(
    @Inject('COMPRA_REPOSITORY')
    private compraRepository: Repository<Compra>,
    @Inject('COMPRA_DETALLE_REPOSITORY')
    private compraDetalleRepository: Repository<CompraDetalle>,
    @Inject('REPUESTO_REPOSITORY')
    private repuestoRepository: Repository<Repuesto>,
  ) {}

  // ── helpers ────────────────────────────────────────────────────────────────
  private calcDetalles(detalles: CreateCompraDto['detalles']) {
    let subtotal = 0;
    let descuentoTotal = 0;
    const calculated = detalles.map((d) => {
      const importe = Number(d.cantidad) * Number(d.precioUnitario);
      const descuento = (importe * (d.porcentajeDescuento || 0)) / 100;
      subtotal += importe;
      descuentoTotal += descuento;
      return {
        ...d,
        importe,
        descuentoMonto: descuento,
        subtotal: importe - descuento,
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
    detalles: { repuestoId?: number; cantidad: number }[],
    sign: 1 | -1,
  ) {
    for (const d of detalles) {
      if (!d.repuestoId) continue;
      const rep = await this.repuestoRepository.findOne({
        where: { id: d.repuestoId },
      });
      if (!rep) continue;
      rep.cantidad = Number(rep.cantidad) + sign * Number(d.cantidad);
      rep.updatedAt = new Date();
      await this.repuestoRepository.save(rep);
    }
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

      // Apply new stock (+)
      await this.incrementStock(calculated, 1);
    } else {
      await this.compraRepository.update(id, {
        ...headerFields,
        updatedAt: new Date(),
      });
    }

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
      subtotal: compra.subtotal,
      descuentoTotal: compra.descuentoTotal,
      total: compra.total,
      detalles,
      createdAt: compra.createdAt,
      updatedAt: compra.updatedAt,
    };
  }
}
