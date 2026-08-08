export interface DashboardOT {
  id: number;
  descripcionTarea: string;
  estado: string;
  fechaHora: string;
  fechaCreacion: string;
  tiempoEstimado?: number;
  tipoEjecucion?: string;
  maquina_id?: number;
  maquina?: { id?: number; nombre?: string; name?: string };
  tipoOT?: { id?: number; nombre?: string; name?: string };
  departamento?: { id?: number; nombre?: string; name?: string };
  costCenter?: { id?: number; nombre?: string; name?: string };
}

export interface DashboardMaquina {
  id: number;
  name: string;
  tipoDeMaquina?: string;
}

export interface DashboardDepartamento {
  id: number;
  nombre: string;
}

export interface DashboardTipoOT {
  id: number;
  nombre: string;
}

export interface DashboardUsuario {
  id: number;
  name: string;
  lastName: string;
  hora$?: number | null;
  minutos$?: number | null;
}

export interface DashboardInformeDetalle {
  id: number;
  otId: number;
  horaInicio: string;
  horaFinalización: string;
  createdAt: string;
}

export interface DashboardInforme {
  id: number;
  userId: number;
  detalles: DashboardInformeDetalle[];
  createdAt: string;
}

export interface DashboardSalida {
  id: number;
  otId: number;
  total: number;
  fecha: string;
}

export interface NameValue {
  name: string;
  value: number;
}

export interface RankingActivo {
  id: number;
  nombre: string;
  ots: number;
  horas: number;
  costo: number;
}

export interface RankingTecnico {
  id: number;
  nombre: string;
  horas: number;
  costo: number;
  intervenciones: number;
}

export interface OTVencida {
  id: number;
  descripcion: string;
  maquina: string;
  estado: string;
  diasAbierta: number;
  fechaCreacion: string;
}

export interface DashboardSummary {
  totalOTs: number;
  otsAbiertas: number;
  otsEnProgreso: number;
  otsCerradas: number;
  cumplimiento: number; // % cerradas sobre total
  horasTrabajadas: number;
  costoManoObra: number;
  costoMateriales: number;
  costoTotal: number;
  costoPromedioPorOT: number;
  mttr: number; // horas promedio por OT correctiva cerrada
}

export interface DashboardData {
  summary: DashboardSummary;
  otsPorMes: NameValue[]; // creadas
  otsCerradasPorMes: NameValue[];
  costoPorMes: NameValue[];
  otsPorEstado: NameValue[];
  otsPorTipo: NameValue[];
  otsPorDepartamento: NameValue[];
  rankingActivos: RankingActivo[];
  rankingTecnicos: RankingTecnico[];
  otsVencidas: OTVencida[];
}
