export interface Process {
  id: number;
  name: string;
  centroCosto: number; // id del centro de costo
  correlativo?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProcessDto {
  centroCosto_id: number;
  name: string;
  correlativo?: number;
}

export interface UpdateProcessDto {
  name?: string;
  centroCosto_id?: number;
  correlativo?: number;
}
