export class Maquina {
  id: number;
  name: string;
  fabricante: string;
  tipoDeMaquina: string;
  numeroDeSerie: string;
  fechaDeFabricacion: Date;
  fechaDeMontaje: Date;
  costo: number;
  horasTrabajadas: number;
  centroCosto_id: number;
  proceso_id: number;
  proveedor_id: number;
  correlativo?: number;
  createdAt: Date;
  updatedAt: Date;
}
