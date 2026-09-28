import { SubUnidad } from '../types/subUnidad.types';
import {
  Columna,
  ManagementTable,
} from '../../../shared/components/management/ManagementTable';
import { fmtFecha } from '../../../shared/utils/format';
import { codigoSubUnidad } from '../../../shared/utils/codigos';

export interface SelectOption {
  id: number;
  name: string;
}

export interface ProcessOption extends SelectOption {
  centroCosto: number;
  correlativo?: number;
}

export interface MachineOption extends SelectOption {
  centroCosto: number;
  proceso: number;
  correlativo?: number;
}

interface SubUnidadTableProps {
  subUnidades: SubUnidad[];
  procesos: ProcessOption[];
  maquinas: MachineOption[];
  onViewSubUnidad: (row: SubUnidad) => void;
  loading: boolean;
  error: string | null;
}

export const SubUnidadTable = ({
  subUnidades,
  procesos,
  maquinas,
  onViewSubUnidad,
  loading,
  error,
}: SubUnidadTableProps) => {
  const maquinaDe = (s: SubUnidad) =>
    maquinas.find((m) => m.id === s.maquina_id);

  const columns: Columna<SubUnidad>[] = [
    {
      header: 'Código',
      render: (r) => codigoSubUnidad(r, maquinas, procesos) ?? `ID ${r.id}`,
      className: 'w-32 font-medium whitespace-nowrap',
    },
    {
      header: 'Descripción',
      render: (r) => r.descripcion,
      className: 'font-medium',
    },
    {
      header: 'Máquina',
      render: (r) => maquinaDe(r)?.name ?? `ID ${r.maquina_id}`,
    },
    {
      header: 'Creado',
      render: (r) => fmtFecha(r.createdAt),
      className: 'hidden md:table-cell',
    },
    {
      header: 'Actualizado',
      render: (r) => fmtFecha(r.updatedAt),
      className: 'hidden lg:table-cell',
    },
  ];

  return (
    <ManagementTable
      rows={subUnidades}
      columns={columns}
      onRowClick={onViewSubUnidad}
      loading={loading}
      error={error}
      emptyMessage="Todavía no hay subunidades registradas."
    />
  );
};
