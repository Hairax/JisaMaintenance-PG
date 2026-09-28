import { Process } from '../types/process.types';
import {
  Columna,
  ManagementTable,
} from '../../../shared/components/management/ManagementTable';
import { fmtFecha } from '../../../shared/utils/format';
import { codigoProceso } from '../../../shared/utils/codigos';

interface ProcessTableProps {
  processes: Process[];
  onViewProcess: (row: Process) => void;
  loading: boolean;
  error: string | null;
  centrosCosto: { id: number; name: string }[];
}

export const ProcessTable = ({
  processes,
  onViewProcess,
  loading,
  error,
  centrosCosto,
}: ProcessTableProps) => {
  const columns: Columna<Process>[] = [
    {
      header: 'Código',
      render: (r) => codigoProceso(r),
      className: 'w-24 font-medium',
    },
    { header: 'Nombre', render: (r) => r.name, className: 'font-medium' },
    {
      header: 'Centro de costo',
      render: (r) =>
        centrosCosto.find((cc) => cc.id === r.centroCosto)?.name ??
        `ID ${r.centroCosto}`,
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
      rows={processes}
      columns={columns}
      onRowClick={onViewProcess}
      loading={loading}
      error={error}
      emptyMessage="Todavía no hay procesos registrados."
    />
  );
};
