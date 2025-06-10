export interface RepuestoMaquina {
  id: number;
  nombre: string;
  cantidad: number;
  costoUnitario: number;
  descripcion: string;
  createdAt: string;
  updatedAt: string;
  maquina_id: number;
  subUnidad_id?: number | null;
}

export interface CreateRepuestoMaquinaDto {
  nombre: string;
  cantidad: number;
  costoUnitario: number;
  descripcion?: string;
  maquina_id: number;
  subUnidad?: number;
}

export interface UpdateRepuestoMaquinaDto {
  nombre?: string;
  cantidad?: number;
  costoUnitario?: number;
  descripcion?: string;
  maquina_id?: number;
  subUnidad?: number | null;
}
