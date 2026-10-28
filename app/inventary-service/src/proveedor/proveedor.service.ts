import { BadRequestException, Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Proveedor } from './entities/proveedor.entity';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { ResponseProveedorDto } from './dto/response-proveedor.dto';

export const MAX_FILAS_IMPORTACION = 5000;
const MAX_ID = 2147483647; // INT de MySQL

export interface FilaImportacionProveedor {
  fila?: number;
  codigo?: unknown;
  nombre?: unknown;
  nit?: unknown;
}

export interface ResultadoImportacion {
  total: number;
  creados: number;
  omitidos: { fila: number; motivo: string }[];
}

const MSG_CODIGO_INVALIDO =
  'El código del proveedor debe ser un número entero mayor a 0.';

/** Código (= ID): undefined si viene vacío, null si es inválido. */
function parsearCodigo(v: unknown): number | undefined | null {
  const t = String(v ?? '').trim();
  if (!t) return undefined;
  if (!/^\d+$/.test(t)) return null;
  const n = Number(t);
  return n > 0 && n <= MAX_ID ? n : null;
}

@Injectable()
export class ProveedorService {
  constructor(
    @Inject('PROVEEDOR_REPOSITORY')
    private proveedorRepository: Repository<Proveedor>,
  ) {}

  async create(dto: CreateProveedorDto): Promise<ResponseProveedorDto> {
    // Código (= ID) opcional: si viene, debe ser un entero libre.
    const id = parsearCodigo(dto.id);
    if (id === null) throw new BadRequestException(MSG_CODIGO_INVALIDO);
    if (id !== undefined) {
      const existe = await this.proveedorRepository.findOne({ where: { id } });
      if (existe) {
        throw new BadRequestException(
          `Ya existe un proveedor con el código ${id} (${existe.nombre}).`,
        );
      }
    }
    const nombre = dto.nombre?.trim();
    if (!nombre) throw new BadRequestException('El nombre es obligatorio.');
    // Solo el nombre es obligatorio; lo demás se puede completar después.
    const proveedor = this.proveedorRepository.create({
      ...(id !== undefined && { id }),
      nombre,
      ruc: dto.ruc?.trim() ?? '',
      correoElectronico: dto.correoElectronico?.trim() ?? '',
      telefono: dto.telefono?.trim() ?? '',
      direccion: dto.direccion?.trim() ?? '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const saved = await this.proveedorRepository.save(proveedor);
    return this.toResponseDto(saved);
  }

  async findAll(): Promise<ResponseProveedorDto[]> {
    const proveedores = await this.proveedorRepository.find();
    return proveedores.map(this.toResponseDto);
  }

  async findOne(id: number): Promise<ResponseProveedorDto> {
    const proveedor = await this.proveedorRepository.findOne({ where: { id } });
    if (!proveedor) throw new Error('Proveedor not found');
    return this.toResponseDto(proveedor);
  }

  async update(
    id: number,
    dto: UpdateProveedorDto,
  ): Promise<ResponseProveedorDto> {
    const proveedor = await this.proveedorRepository.findOne({ where: { id } });
    if (!proveedor) throw new Error('Proveedor not found');
    const updated = this.proveedorRepository.merge(proveedor, {
      ...dto,
      nombre: dto.nombre ?? proveedor.nombre,
      updatedAt: new Date(),
    });
    const saved = await this.proveedorRepository.save(updated);
    return this.toResponseDto(saved);
  }

  async remove(id: number): Promise<void> {
    const proveedor = await this.proveedorRepository.findOne({ where: { id } });
    if (!proveedor) throw new Error('Proveedor not found');
    await this.proveedorRepository.remove(proveedor);
  }

  /**
   * Importación por lote. Cada fila trae código (= ID del proveedor), nombre
   * y NIT. Se omiten (con su motivo) las filas sin nombre, con código no
   * numérico, con un código o NIT ya registrados, o repetidos dentro del
   * mismo archivo. Sin código, el ID se asigna automáticamente. Teléfono,
   * correo y dirección quedan vacíos. Todo se guarda en una transacción.
   */
  async importar(
    filas: FilaImportacionProveedor[],
  ): Promise<ResultadoImportacion> {
    if (!Array.isArray(filas) || filas.length === 0) {
      throw new BadRequestException('El archivo no tiene filas para importar.');
    }
    if (filas.length > MAX_FILAS_IMPORTACION) {
      throw new BadRequestException(
        `Máximo ${MAX_FILAS_IMPORTACION} proveedores por importación.`,
      );
    }
    const texto = (v: unknown) => String(v ?? '').trim();
    const claveNit = (v: string) => v.toLowerCase().replace(/\s+/g, '');

    const existentes = await this.proveedorRepository.find();
    const ids = new Set(existentes.map((p) => p.id));
    const nits = new Set(
      existentes.map((p) => claveNit(p.ruc ?? '')).filter(Boolean),
    );

    const omitidos: { fila: number; motivo: string }[] = [];
    const nuevos: Proveedor[] = [];
    filas.forEach((f, i) => {
      const fila = Number(f.fila) || i + 2; // fila de Excel (1 = encabezados)
      const nombre = texto(f.nombre);
      const nit = texto(f.nit);
      const id = parsearCodigo(f.codigo);
      if (!nombre) return omitidos.push({ fila, motivo: 'Falta el nombre' });
      if (id === null) {
        return omitidos.push({
          fila,
          motivo: `Código "${texto(f.codigo)}" inválido: debe ser un número entero`,
        });
      }
      if (id !== undefined && ids.has(id)) {
        return omitidos.push({ fila, motivo: `El código ${id} ya existe` });
      }
      if (nit && nits.has(claveNit(nit))) {
        return omitidos.push({ fila, motivo: `El NIT ${nit} ya existe` });
      }
      if (id !== undefined) ids.add(id);
      if (nit) nits.add(claveNit(nit));
      nuevos.push(
        this.proveedorRepository.create({
          ...(id !== undefined && { id }),
          nombre,
          ruc: nit,
          telefono: '',
          correoElectronico: '',
          direccion: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );
    });

    if (nuevos.length > 0) {
      await this.proveedorRepository.manager.transaction((m) => m.save(nuevos));
    }
    return { total: filas.length, creados: nuevos.length, omitidos };
  }

  private toResponseDto = (p: Proveedor): ResponseProveedorDto => ({
    id: p.id,
    nombre: p.nombre,
    ruc: p.ruc,
    correoElectronico: p.correoElectronico,
    telefono: p.telefono,
    direccion: p.direccion,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  });
}
