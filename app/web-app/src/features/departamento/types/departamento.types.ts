export interface Departamento {
  id: number;
  nombre: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface CreateDepartamentoDto {
  nombre: string;
}

export interface UpdateDepartamentoDto {
  nombre: string;
}
