import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Compra } from './entities/compra.entity';
import { CompraDetalle } from './entities/compra-detalle.entity';
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
  ) {}

  async create(createCompraDto: CreateCompraDto): Promise<ResponseCompraDto> {
    // Calcular totales
    const { detalles, ...compraData } = createCompraDto;

    let subtotal = 0;
    let descuentoTotal = 0;

    // Calcular totales del JSON de productos
    const detallesCalculados = detalles.map((producto) => {
      const importe =
        Number(producto.cantidad) * Number(producto.precioUnitario);
      const descuento = (importe * (producto.porcentajeDescuento || 0)) / 100;
      const subtotalProducto = importe - descuento;

      subtotal += importe;
      descuentoTotal += descuento;

      return {
        ...producto,
        importe,
        descuentoMonto: descuento,
        subtotal: subtotalProducto,
      };
    });

    const total = subtotal - descuentoTotal;

    // Crear la compra
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

    // Guardar los detalles
    const detalleEntities = detallesCalculados.map((detalle) =>
      this.compraDetalleRepository.create({
        compraId: savedCompra.id,
        ...detalle,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    const savedDetalles =
      await this.compraDetalleRepository.save(detalleEntities);

    return {
      id: savedCompra.id,
      nroDocumento: savedCompra.nroDocumento,
      tipoDocumento: savedCompra.tipoDocumento,
      nroFactura: savedCompra.nroFactura,
      nit: savedCompra.nit,
      proveedorId: savedCompra.proveedorId,
      detalle: savedCompra.detalle,
      almacen: savedCompra.almacen,
      fecha: savedCompra.fecha,
      tipoCambio: savedCompra.tipoCambio,
      nroAutorizacion: savedCompra.nroAutorizacion,
      subtotal: savedCompra.subtotal,
      descuentoTotal: savedCompra.descuentoTotal,
      total: savedCompra.total,
      detalles: savedDetalles,
      createdAt: savedCompra.createdAt,
      updatedAt: savedCompra.updatedAt,
    };
  }

  async findAll(): Promise<Compra[]> {
    return this.compraRepository.find({
      relations: ['proveedor', 'detalles'],
    });
  }

  async findOne(id: number): Promise<Compra> {
    const compra = await this.compraRepository.findOne({
      where: { id },
      relations: ['proveedor', 'detalles'],
    });
    if (!compra) {
      throw new Error('Compra not found');
    }
    return compra;
  }

  async update(id: number, updateCompraDto: UpdateCompraDto): Promise<Compra> {
    const compra = await this.findOne(id);
    Object.assign(compra, updateCompraDto);
    compra.updatedAt = new Date();
    return await this.compraRepository.save(compra);
  }

  async remove(id: number): Promise<void> {
    const compra = await this.findOne(id);
    await this.compraRepository.remove(compra);
  }
}
