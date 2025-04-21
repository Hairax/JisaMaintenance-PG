export class RepuestoMaquina {
  id: number;
  nombre: string;
  cantidad: number;
  costoUnitario: number;
  descripcion: string;
  createdAt: Date;
  updatedAt: Date;
  maquina_id: number;
  subUnidad_id?: number | null;
}
