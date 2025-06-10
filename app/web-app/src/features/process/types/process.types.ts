export interface Process {
  id: number;
  name: string;
  centroCosto: number; // id del centro de costo
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProcessDto {
  centroCosto_id: number;
  name: string;
}

export interface UpdateProcessDto {
  name?: string;
  centroCosto_id?: number;
}
