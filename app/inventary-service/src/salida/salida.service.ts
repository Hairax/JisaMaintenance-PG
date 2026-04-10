import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Salida } from './entities/salida.entity';
import { SalidaDetalle } from './entities/salida-detalle.entity';
import { Repuesto } from '../repuesto/entities/repuesto.entity';
import { CreateSalidaDto } from './dto/create-salida.dto';
import { UpdateSalidaDto } from './dto/update-salida.dto';

@Injectable()
export class SalidaService {
  constructor(
    @Inject('SALIDA_REPOSITORY')
    private salidaRepository: Repository<Salida>,
    @Inject('SALIDA_DETALLE_REPOSITORY')
    private salidaDetalleRepository: Repository<SalidaDetalle>,
    @Inject('REPUESTO_REPOSITORY')
    private repuestoRepository: Repository<Repuesto>,
  ) {}

  private calcDetalles(detalles: CreateSalidaDto['detalles']) {
    let subtotal = 0;
    const calculated = detalles.map((d) => {
      const importe = Number(d.cantidad) * Number(d.precioUnitario);
      subtotal += importe;
      return {
        ...d,
        tipoProducto: 'repuesto' as const,
        importe,
        descuentoMonto: 0,
        porcentajeDescuento: 0,
        subtotal: importe,
      };
    });
    return { calculated, subtotal, total: subtotal };
  }

  private async adjustStock(
    detalles: { repuestoId?: number; cantidad: number }[],
    sign: 1 | -1,
  ) {
    for (const d of detalles) {
      if (!d.repuestoId) continue;
      const repuesto = await this.repuestoRepository.findOne({
        where: { id: d.repuestoId },
      });
      if (!repuesto) continue;
      repuesto.cantidad = Number(repuesto.cantidad) + sign * Number(d.cantidad);
      repuesto.updatedAt = new Date();
      await this.repuestoRepository.save(repuesto);
    }
  }

  private async validateStockAndBuildAlerts(
    detalles: { repuestoId: number; cantidad: number; nombre?: string }[],
  ) {
    const alerts: string[] = [];
    for (const d of detalles) {
      const repuesto = await this.repuestoRepository.findOne({
        where: { id: Number(d.repuestoId) },
      });
      if (!repuesto) {
        throw new Error(`Repuesto ${d.repuestoId} no encontrado`);
      }
      const current = Number(repuesto.cantidad);
      const requested = Number(d.cantidad);
      const remaining = current - requested;
      if (requested <= 0) {
        throw new Error(`Cantidad inválida para repuesto ${repuesto.id}`);
      }
      if (remaining < 0) {
        throw new Error(
          `Stock insuficiente para ${repuesto.nombre} (ID ${repuesto.id}). Disponible: ${current}, solicitado: ${requested}`,
        );
      }

      const critical = Number(repuesto.stockCritico || 0);
      if (critical > 0 && remaining <= critical) {
        alerts.push(
          `Alerta de stock crítico: ${repuesto.nombre} (ID ${repuesto.id}) quedará en ${remaining} unidades (límite crítico ${critical}).`,
        );
      }
    }
    return alerts;
  }

  async create(createSalidaDto: CreateSalidaDto): Promise<Salida> {
    const { detalles, ...salidaData } = createSalidaDto;
    const { calculated, subtotal, total } = this.calcDetalles(detalles);
    const alertasStockCritico =
      await this.validateStockAndBuildAlerts(calculated);

    const salida = this.salidaRepository.create({
      ...salidaData,
      nroSalida: 'PENDIENTE',
      subtotal,
      descuentoTotal: 0,
      total,
      estado: 'completada',
      createdAt: new Date(),
      updatedAt: new Date(),
      detalles: [],
    });

    const savedSalida = await this.salidaRepository.save(salida);
    await this.salidaRepository.update(savedSalida.id, {
      nroSalida: String(savedSalida.id),
      updatedAt: new Date(),
    });

    const detallesGuardados = await this.salidaDetalleRepository.save(
      calculated.map((d) =>
        this.salidaDetalleRepository.create({
          salidaId: savedSalida.id,
          ...d,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ),
    );

    await this.adjustStock(calculated, -1);

    const salidaFinal = await this.findOne(savedSalida.id);
    if (!salidaFinal) {
      throw new Error('No se pudo recuperar la salida creada');
    }
    salidaFinal.detalles = detallesGuardados;
    return Object.assign(salidaFinal, { alertasStockCritico });
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
    const { detalles, ...salidaData } = updateSalidaDto;

    const salida = await this.findOne(id);

    if (!salida) {
      throw new Error('Salida no encontrada');
    }

    // Reverse old stock before replacing details
    if (salida.detalles?.length) {
      await this.adjustStock(salida.detalles, 1);
    }

    await this.salidaDetalleRepository
      .createQueryBuilder()
      .delete()
      .where('salidaId = :salidaId', { salidaId: id })
      .execute();

    let alertasStockCritico: string[] = [];
    let detallesGuardados: SalidaDetalle[] = [];

    if (detalles?.length) {
      const { calculated, subtotal, total } = this.calcDetalles(detalles);
      alertasStockCritico = await this.validateStockAndBuildAlerts(calculated);

      await this.salidaRepository.update(id, {
        ...salidaData,
        subtotal,
        descuentoTotal: 0,
        total,
        updatedAt: new Date(),
      });

      detallesGuardados = await this.salidaDetalleRepository.save(
        calculated.map((d) =>
          this.salidaDetalleRepository.create({
            salidaId: id,
            ...d,
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        ),
      );

      await this.adjustStock(calculated, -1);
    } else {
      await this.salidaRepository.update(id, {
        ...salidaData,
        subtotal: 0,
        descuentoTotal: 0,
        total: 0,
        updatedAt: new Date(),
      });
    }

    const updated = await this.findOne(id);
    if (!updated) {
      throw new Error('No se pudo recuperar la salida actualizada');
    }
    updated.detalles = updated.detalles ?? detallesGuardados;
    return Object.assign(updated, { alertasStockCritico });
  }

  async remove(id: number): Promise<void> {
    const salida = await this.findOne(id);
    if (!salida) {
      throw new Error('Salida no encontrada');
    }
    if (salida?.detalles?.length) {
      await this.adjustStock(salida.detalles, 1);
    }
    await this.salidaRepository.remove(salida);
  }
}
