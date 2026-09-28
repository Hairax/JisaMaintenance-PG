import { Objeto } from '../types/objeto.types';
import {
  Columna,
  ManagementTable,
} from '../../../shared/components/management/ManagementTable';
import { fmtFecha } from '../../../shared/utils/format';

interface ObjetoTableProps {
  objetos: Objeto[];
  onViewObjeto: (row: Objeto) => void;
  loading: boolean;
  error: string | null;
}

export const ObjetoTable = ({
  objetos,
  onViewObjeto,
  loading,
  error,
}: ObjetoTableProps) => {
  const columns: Columna<Objeto>[] = [
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
      rows={objetos}
      columns={columns}
      onRowClick={onViewObjeto}
      loading={loading}
      error={error}
      emptyMessage="Todavía no hay objetos registrados."
    />
  );
};
