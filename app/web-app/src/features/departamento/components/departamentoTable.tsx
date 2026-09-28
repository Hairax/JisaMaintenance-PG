import { Departamento } from '../types/departamento.types';
import {
  Columna,
  ManagementTable,
} from '../../../shared/components/management/ManagementTable';
import { fmtFecha } from '../../../shared/utils/format';

interface DepartamentoTableProps {
  departamentos: Departamento[];
  onViewDepartamento: (row: Departamento) => void;
  loading: boolean;
  error: string | null;
}

export const DepartamentoTable = ({
  departamentos,
  onViewDepartamento,
  loading,
  error,
}: DepartamentoTableProps) => {
  const columns: Columna<Departamento>[] = [
    { header: 'ID', render: (r) => r.id, className: 'w-20 font-medium' },
    { header: 'Nombre', render: (r) => r.nombre, className: 'font-medium' },
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
      rows={departamentos}
      columns={columns}
      onRowClick={onViewDepartamento}
      loading={loading}
      error={error}
      emptyMessage="Todavía no hay departamentos registrados."
    />
  );
};
