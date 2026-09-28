import { Proveedor } from '../../../shared/types/proveedor.types';
import {
  Columna,
  ManagementTable,
} from '../../../shared/components/management/ManagementTable';

interface ProveedoresTableProps {
  proveedores: Proveedor[];
  onViewProveedor: (row: Proveedor) => void;
  loading: boolean;
  error: string | null;
}

export const ProveedoresTable = ({
  proveedores,
  onViewProveedor,
  loading,
  error,
}: ProveedoresTableProps) => {
  const columns: Columna<Proveedor>[] = [
    { header: 'ID', render: (r) => r.id, className: 'w-20 font-medium' },
    { header: 'Nombre', render: (r) => r.nombre, className: 'font-medium' },
    { header: 'NIT / RUC', render: (r) => r.ruc || '—' },
    {
      header: 'Correo',
      render: (r) => r.correoElectronico || '—',
      className: 'hidden md:table-cell',
    },
    { header: 'Teléfono', render: (r) => r.telefono || '—' },
    {
      header: 'Dirección',
      render: (r) => r.direccion || '—',
      className: 'hidden lg:table-cell',
    },
  ];

  return (
    <ManagementTable
      rows={proveedores}
      columns={columns}
      onRowClick={onViewProveedor}
      loading={loading}
      error={error}
      emptyMessage="Todavía no hay proveedores registrados."
    />
  );
};
