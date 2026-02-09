export class InformeDetalleEntity {
  id: number;
  informeDiario_id: number;
  ordenTrabajo_id: number;
  horaInicio: string;
  horaFin: string;
  descripcionLabor: string;
  horasCalculadas: number;
  costoCalculado: number;
  fechaCreacion: Date;
  fechaModificacion: Date;
}
