import type { ProgramacionOt } from '../types/programacionOt.types';
import { API_URL } from '../../../shared/config/api';

const API_BASE_URL = API_URL;

export interface OcurrenciaProgramacion {
  programacionId: number;
  nombre: string;
  descripcionTarea: string;
  fecha: string;
  maquina_id: number;
  tipoOT_id: number;
  tipoEjecucion: string;
  activo: boolean;
}

async function handle<T>(res: Response, fallback: string): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || fallback);
  }
  return res.json();
}

export const programacionOtService = {
  async getAll(): Promise<ProgramacionOt[]> {
    const res = await fetch(`${API_BASE_URL}/programaciones-ot`);
    return handle(res, 'Error al cargar las programaciones');
  },

  async create(data: Record<string, unknown>): Promise<ProgramacionOt> {
    const res = await fetch(`${API_BASE_URL}/programaciones-ot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handle(res, 'Error al crear la programación');
  },

  async update(
    id: number,
    data: Record<string, unknown>,
  ): Promise<ProgramacionOt> {
    const res = await fetch(`${API_BASE_URL}/programaciones-ot/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handle(res, 'Error al actualizar la programación');
  },

  async remove(id: number): Promise<{ deleted: boolean }> {
    const res = await fetch(`${API_BASE_URL}/programaciones-ot/${id}`, {
      method: 'DELETE',
    });
    return handle(res, 'Error al eliminar la programación');
  },

  async ejecutarAhora(id: number): Promise<ProgramacionOt> {
    const res = await fetch(
      `${API_BASE_URL}/programaciones-ot/${id}/ejecutar`,
      { method: 'POST' },
    );
    return handle(res, 'Error al ejecutar la programación');
  },

  async getOcurrencias(
    desde: string,
    hasta: string,
  ): Promise<OcurrenciaProgramacion[]> {
    const params = new URLSearchParams({ desde, hasta });
    const res = await fetch(
      `${API_BASE_URL}/programaciones-ot/ocurrencias?${params.toString()}`,
    );
    return handle(res, 'Error al cargar el calendario de mantenimientos');
  },
};
