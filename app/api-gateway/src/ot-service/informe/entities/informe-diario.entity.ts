export class InformeDiarioEntity {
  id: number;
  tecnico_id: number;
  fechaTrabajo: Date;
  observaciones?: string;
  fechaCreacion: Date;
  fechaModificacion: Date;
}
