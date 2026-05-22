export class ResponseRepuestoDto {
  id: number;
  tipo: string;
  codigoPersonalizado: string;
  nombre: string;
  descripcion: string;
  uMedida: string;
  almacen: string;
  numeroDeParte: string;
  ubicacion: string;
  especificacion: string;
  costoUnitario: number;
  costoUnitarioPonderado: number;
  aperturaCantidad: number;
  aperturaCostoUnitario: number;
  cantidad: number;
  stockCritico: number;
  correlativo: number;
  centroCosto_id: number;
  proceso_id: number;
  maquina_id: number;
  subUnidad_id: number;
  createdAt: Date;
  updatedAt: Date;
}
