export class Repuesto {
  id: number;
  nombre: string;
  descripcion: string;
  uMedida: string;
  numeroDeParte: string;
  ubicacion: string;
  especificacion: string;
  costoUnitario: number;
  cantidad: number;
  stockCritico: number;
  contable: boolean;
  correlativo: number;
  centroCosto_id: number;
  proceso_id: number;
  maquina_id: number;
  subUnidad_id: number;
  createdAt: Date;
  updatedAt: Date;
}
