export interface InformeDiarioTrabajo {
  id: number;
  tecnico_id: number;
  fechaTrabajo: string | Date;
  observaciones?: string;
  fechaCreacion: string | Date;
  fechaModificacion: string | Date;
}

export interface InformeDetalleTrabajo {
  id: number;
  informeDiario_id: number;
  ordenTrabajo_id: number;
  horaInicio: string;
  horaFin: string;
  descripcionLabor: string;
  horasCalculadas: number;
  costoCalculado: number;
  fechaCreacion: string | Date;
  fechaModificacion: string | Date;
}

export type InformeDiarioFormData = Partial<
  Omit<InformeDiarioTrabajo, 'id' | 'fechaCreacion' | 'fechaModificacion'>
>;
export type InformeDetalleFormData = Partial<
  Omit<InformeDetalleTrabajo, 'id' | 'fechaCreacion' | 'fechaModificacion'>
>;

export type ModalMode = 'view' | 'edit' | 'create';

export interface InformeManagementState {
  informes: InformeDiarioTrabajo[];
  detalles: InformeDetalleTrabajo[];
  loading: boolean;
  error: string | null;
  isModalOpen: boolean;
  modalMode: ModalMode;
  selectedInforme: InformeDiarioTrabajo | null;
  selectedDetalle: InformeDetalleTrabajo | null;
  formData: Partial<InformeDiarioFormData>;
  detalleFormData: Partial<InformeDetalleFormData>;
}
