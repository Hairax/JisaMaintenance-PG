export interface Repuesto {
  id: number;
  nombre: string;
  cantidad: number;
  costoUnitario: number;
  descripcion: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateRepuestoDto = Omit<
  Repuesto,
  'id' | 'createdAt' | 'updatedAt'
>;

export type UpdateRepuestoDto = Partial<CreateRepuestoDto>;
