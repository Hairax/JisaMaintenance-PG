export type FrecuenciaUnidad = 'dias' | 'semanas' | 'meses';

export interface ProgramacionOt {
  id: number;
  nombre?: string;
  maquina_id: number;
  subUnidad_id?: number | null;
  centroCosto_id: number;
  proceso_id: number;
  tipoOT_id: number;
  departamento_id: number;
  objeto_id: number;
  supervisor_id: number;
  tipoEjecucion: string;
  descripcionTarea: string;
  indicacionesEspeciales?: string;
  tiempoEstimado?: number;
  frecuenciaValor: number;
  frecuenciaUnidad: FrecuenciaUnidad;
  fechaInicio: string;
  proximaEjecucion: string;
  ultimaEjecucion?: string | null;
  ultimaOtGeneradaId?: number | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ProgramacionOtFormData = {
  nombre: string;
  maquina_id: string;
  subUnidad_id: string;
  centroCosto_id: string;
  proceso_id: string;
  tipoOT_id: string;
  departamento_id: string;
  objeto_id: string;
  supervisor_id: string;
  tipoEjecucion: string;
  descripcionTarea: string;
  indicacionesEspeciales: string;
  tiempoEstimado: string;
  frecuenciaValor: string;
  frecuenciaUnidad: FrecuenciaUnidad;
  fechaInicio: string;
  activo: boolean;
};

export const EMPTY_FORM: ProgramacionOtFormData = {
  nombre: '',
  maquina_id: '',
  subUnidad_id: '',
  centroCosto_id: '',
  proceso_id: '',
  tipoOT_id: '',
  departamento_id: '',
  objeto_id: '',
  supervisor_id: '',
  tipoEjecucion: 'Preventivo',
  descripcionTarea: '',
  indicacionesEspeciales: '',
  tiempoEstimado: '',
  frecuenciaValor: '30',
  frecuenciaUnidad: 'dias',
  fechaInicio: new Date().toISOString().slice(0, 10),
  activo: true,
};
