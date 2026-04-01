import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Salida } from './entities/salida.entity';
import { SalidaDetalle } from './entities/salida-detalle.entity';
import { CreateSalidaDto } from './dto/create-salida.dto';
import { UpdateSalidaDto } from './dto/update-salida.dto';

@Injectable()
export class SalidaService {
  constructor(
    @Inject('SALIDA_REPOSITORY')
    private salidaRepository: Repository<Salida>,
    @Inject('SALIDA_DETALLE_REPOSITORY')
    private salidaDetalleRepository: Repository<SalidaDetalle>,
  ) {}

  async create(createSalidaDto: CreateSalidaDto): Promise<Salida> {
    const { detalles, ...salidaData } = createSalidaDto;

    // Calcular totales
    const detallesConCalculos = detalles.map((d) => {
      const importe = d.cantidad * d.precioUnitario;
      const descuentoMonto = (importe * (d.porcentajeDescuento || 0)) / 100;
      const subtotal = importe - descuentoMonto;

      return {
        ...d,
        importe,
        descuentoMonto,
        subtotal,
      };
    });

    // Sumar totales
    let subtotal = 0;
    let descuentoTotal = 0;
    detallesConCalculos.forEach((d) => {
      subtotal += d.importe;
      descuentoTotal += d.descuentoMonto;
    });

    const total = subtotal - descuentoTotal;

    const salida = this.salidaRepository.create({
      ...salidaData,
      subtotal,
      descuentoTotal,
      total,
    });

    const savedSalida = await this.salidaRepository.save(salida);

    // Crear detalles
    const detallesGuardados = await Promise.all(
      detallesConCalculos.map((d) =>
        this.salidaDetalleRepository.save({
          salidaId: savedSalida.id,
          ...d,
        }),
      ),
    );

    savedSalida.detalles = detallesGuardados;
    return savedSalida;
  }

  async findAll(): Promise<Salida[]> {
    return this.salidaRepository.find({
      relations: ['detalles'],
    });
  }

  async findOne(id: number): Promise<Salida | null> {
    return this.salidaRepository.findOne({
      where: { id },
      relations: ['detalles'],
    });
  }

  async update(id: number, updateSalidaDto: UpdateSalidaDto): Promise<Salida> {
    const { detalles, ...salidaData } = updateSalidaDto as any;

    const salida = await this.findOne(id);

    if (!salida) {
      throw new Error('Salida no encontrada');
    }

    Object.assign(salida, salidaData);

    if (detalles && detalles.length > 0) {
      // Eliminar detalles anteriores
      await this.salidaDetalleRepository.delete({ salidaId: id });

      // Recalcular
      const detallesConCalculos = detalles.map((d) => {
        const importe = d.cantidad * d.precioUnitario;
        const descuentoMonto = (importe * (d.porcentajeDescuento || 0)) / 100;
        const subtotal = importe - descuentoMonto;

        return {
          ...d,
          importe,
          descuentoMonto,
          subtotal,
        };
      });

      let subtotal = 0;
      let descuentoTotal = 0;
      detallesConCalculos.forEach((d) => {
        subtotal += d.importe;
        descuentoTotal += d.descuentoMonto;
      });

      salida.subtotal = subtotal;
      salida.descuentoTotal = descuentoTotal;
      salida.total = subtotal - descuentoTotal;

      // Guardar nuevo detalles
      const detallesGuardados = await Promise.all(
        detallesConCalculos.map((d) =>
          this.salidaDetalleRepository.save({
            salidaId: id,
            ...d,
          }),
        ),
      );

      salida.detalles = detallesGuardados;
    }

    return this.salidaRepository.save(salida);
  }

  async remove(id: number): Promise<void> {
    await this.salidaRepository.delete(id);
  }
}
