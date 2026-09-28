import { TipoMantenimiento } from '../types/tipoMantenimiento.types';
import {
  Columna,
  ManagementTable,
} from '../../../shared/components/management/ManagementTable';
import { fmtFecha } from '../../../shared/utils/format';

interface TipoMantenimientoTableProps {
  tiposMantenimiento: TipoMantenimiento[];
  onView: (row: TipoMantenimiento) => void;
  loading: boolean;
  error: string | null;
}

export const TipoMantenimientoTable = ({
  tiposMantenimiento,
  onView,
  loading,
  error,
}: TipoMantenimientoTableProps) => {
  const columns: Columna<TipoMantenimiento>[] = [
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
      rows={tiposMantenimiento}
      columns={columns}
      onRowClick={onView}
      loading={loading}
      error={error}
      emptyMessage="Todavía no hay tipos de mantenimiento registrados."
    />
  );
};
