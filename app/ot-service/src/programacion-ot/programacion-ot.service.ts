import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import {
  FrecuenciaUnidad,
  ProgramacionOt,
} from './entities/programacion-ot.entity';
import { CreateProgramacionOtDto } from './dto/create-programacion-ot.dto';
import { UpdateProgramacionOtDto } from './dto/update-programacion-ot.dto';
import { OrdenTrabajoService } from '../ot/ot.service';

// ── Cálculo de fechas ────────────────────────────────────────────────────────
// La programación está "anclada" a fechaInicio: la próxima ejecución siempre
// cae en fechaInicio + n * frecuencia, nunca "hoy + frecuencia". Así, si el
// servidor estuvo apagado unos días, al reactivarse se genera exactamente
// UNA orden de trabajo pendiente (no un backlog) y la programación salta
// directo a la siguiente fecha futura que le corresponde según su ciclo.

function parseDateOnly(value: string | Date): Date {
  if (value instanceof Date)
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDateOnly(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addPeriodo(
  date: Date,
  unidad: FrecuenciaUnidad,
  factor: number,
): Date {
  const d = new Date(date);
  if (unidad === 'dias') d.setDate(d.getDate() + factor);
  else if (unidad === 'semanas') d.setDate(d.getDate() + factor * 7);
  else d.setMonth(d.getMonth() + factor);
  return d;
}

function primerAnchorDesde(
  fechaInicio: Date,
  valor: number,
  unidad: FrecuenciaUnidad,
  desde: Date,
): Date {
  let anchor = fechaInicio;
  while (anchor < desde) {
    anchor = addPeriodo(anchor, unidad, valor);
  }
  return anchor;
}

@Injectable()
export class ProgramacionOtService {
  private readonly logger = new Logger(ProgramacionOtService.name);

  constructor(
    @Inject('PROGRAMACION_OT_REPOSITORY')
    private readonly repo: Repository<ProgramacionOt>,
    private readonly otService: OrdenTrabajoService,
  ) {}

  // Revisa cada hora si hay programaciones vencidas y genera sus OTs.
  // Se corre con esta frecuencia (y no solo una vez al día) para que las
  // programaciones creadas o editadas durante el día también se disparen
  // el mismo día si su fecha ya se cumplió.
  @Cron(CronExpression.EVERY_HOUR)
  async revisarProgramacionesVencidas() {
    try {
      const { generadas } = await this.ejecutarPendientes();
      if (generadas > 0) {
        this.logger.log(
          `Se generaron ${generadas} OT(s) por programación automática.`,
        );
      }
    } catch (err) {
      this.logger.error('Error al ejecutar programaciones de OT vencidas', err);
    }
  }

  async create(dto: CreateProgramacionOtDto): Promise<ProgramacionOt> {
    const fechaInicio = parseDateOnly(dto.fechaInicio);
    const hoy = parseDateOnly(new Date());
    const proximaEjecucion = primerAnchorDesde(
      fechaInicio,
      dto.frecuenciaValor,
      dto.frecuenciaUnidad,
      hoy,
    );

    const entity = this.repo.create({
      ...dto,
      tipoEjecucion: dto.tipoEjecucion || 'Preventivo',
      activo: dto.activo ?? true,
      fechaInicio: formatDateOnly(fechaInicio),
      proximaEjecucion: formatDateOnly(proximaEjecucion),
    });
    return this.repo.save(entity);
  }

  findAll(): Promise<ProgramacionOt[]> {
    return this.repo.find({ order: { proximaEjecucion: 'ASC' } });
  }

  async findOne(id: number): Promise<ProgramacionOt> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Programación ${id} no encontrada`);
    return item;
  }

  async update(
    id: number,
    dto: UpdateProgramacionOtDto,
  ): Promise<ProgramacionOt> {
    const item = await this.findOne(id);

    const fechaInicioCambio = dto.fechaInicio !== undefined;
    const frecuenciaCambio =
      dto.frecuenciaValor !== undefined || dto.frecuenciaUnidad !== undefined;

    const merged = this.repo.merge(item, dto as Partial<ProgramacionOt>);

    if (fechaInicioCambio || frecuenciaCambio) {
      const fechaInicio = parseDateOnly(merged.fechaInicio);
      const hoy = parseDateOnly(new Date());
      merged.fechaInicio = formatDateOnly(fechaInicio);
      merged.proximaEjecucion = formatDateOnly(
        primerAnchorDesde(
          fechaInicio,
          merged.frecuenciaValor,
          merged.frecuenciaUnidad,
          hoy,
        ),
      );
    }

    return this.repo.save(merged);
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Programación ${id} no encontrada`);
    }
    return { deleted: true };
  }

  /** Genera la OT correspondiente y avanza la programación a su siguiente ciclo. */
  private async generarOtDesdeProgramacion(
    prog: ProgramacionOt,
  ): Promise<void> {
    const ahora = new Date();
    const ot = await this.otService.create({
      tipoOT_id: prog.tipoOT_id,
      centroCosto_id: prog.centroCosto_id,
      proceso_id: prog.proceso_id,
      maquina_id: prog.maquina_id,
      subUnidad_id: prog.subUnidad_id,
      tipoEjecucion: prog.tipoEjecucion,
      departamento_id: prog.departamento_id,
      objeto_id: prog.objeto_id,
      tiempoEstimado: prog.tiempoEstimado,
      supervisor_id: prog.supervisor_id,
      descripcionTarea: prog.descripcionTarea,
      indicacionesEspeciales: prog.indicacionesEspeciales,
      fechaHora: ahora,
      estado: 'Abierta',
    });

    const fechaInicio = parseDateOnly(prog.fechaInicio);
    const diaSiguiente = new Date(parseDateOnly(prog.proximaEjecucion));
    diaSiguiente.setDate(diaSiguiente.getDate() + 1);
    const siguiente = primerAnchorDesde(
      fechaInicio,
      prog.frecuenciaValor,
      prog.frecuenciaUnidad,
      diaSiguiente,
    );

    await this.repo.update(prog.id, {
      ultimaEjecucion: ahora,
      ultimaOtGeneradaId: ot.id,
      proximaEjecucion: formatDateOnly(siguiente),
    });
  }

  /** Llamado por el cron: genera las OTs de todas las programaciones vencidas. */
  async ejecutarPendientes(): Promise<{ generadas: number }> {
    const hoy = parseDateOnly(new Date());
    const pendientes = await this.repo.find({ where: { activo: true } });
    const vencidas = pendientes.filter(
      (p) => parseDateOnly(p.proximaEjecucion) <= hoy,
    );
    for (const prog of vencidas) {
      await this.generarOtDesdeProgramacion(prog);
    }
    return { generadas: vencidas.length };
  }

  /** Ejecuta una programación puntual de inmediato, sin esperar su fecha. */
  async ejecutarAhora(id: number): Promise<ProgramacionOt> {
    const prog = await this.findOne(id);
    await this.generarOtDesdeProgramacion(prog);
    return this.findOne(id);
  }

  /**
   * Proyecta todas las fechas en que cada programación activa generaría (o
   * generó) una OT dentro del rango [desde, hasta], usando la misma
   * matemática de anclaje que la generación real — para que el calendario
   * de planificación anual muestre exactamente lo que va a pasar, sin
   * duplicar la lógica de otro modo.
   */
  async ocurrenciasEnRango(
    desdeStr: string,
    hastaStr: string,
  ): Promise<
    {
      programacionId: number;
      nombre: string;
      descripcionTarea: string;
      fecha: string;
      maquina_id: number;
      tipoOT_id: number;
      tipoEjecucion: string;
      activo: boolean;
    }[]
  > {
    const desde = parseDateOnly(desdeStr);
    const hasta = parseDateOnly(hastaStr);
    const programaciones = await this.repo.find({ where: { activo: true } });

    const ocurrencias: {
      programacionId: number;
      nombre: string;
      descripcionTarea: string;
      fecha: string;
      maquina_id: number;
      tipoOT_id: number;
      tipoEjecucion: string;
      activo: boolean;
    }[] = [];

    for (const prog of programaciones) {
      let fecha = parseDateOnly(prog.fechaInicio);
      if (fecha < desde) {
        fecha = primerAnchorDesde(
          fecha,
          prog.frecuenciaValor,
          prog.frecuenciaUnidad,
          desde,
        );
      }
      while (fecha <= hasta) {
        ocurrencias.push({
          programacionId: prog.id,
          nombre: prog.nombre || prog.descripcionTarea,
          descripcionTarea: prog.descripcionTarea,
          fecha: formatDateOnly(fecha),
          maquina_id: prog.maquina_id,
          tipoOT_id: prog.tipoOT_id,
          tipoEjecucion: prog.tipoEjecucion,
          activo: prog.activo,
        });
        fecha = addPeriodo(fecha, prog.frecuenciaUnidad, prog.frecuenciaValor);
      }
    }

    return ocurrencias;
  }
}
