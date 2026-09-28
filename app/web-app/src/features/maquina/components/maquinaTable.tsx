import { Maquina } from '../types/maquina.types';
import {
  Columna,
  ManagementTable,
} from '../../../shared/components/management/ManagementTable';
import { ProcessOption, SelectOption } from '../hooks/useMaquina';
import { codigoMaquina } from '../../../shared/utils/codigos';

interface MaquinaTableProps {
  maquinas: Maquina[];
  onViewMaquina: (row: Maquina) => void;
  loading: boolean;
  error: string | null;
  procesos: ProcessOption[];
  centrosCosto: SelectOption[];
  proveedores: SelectOption[];
}

export const MaquinaTable = ({
  maquinas,
  onViewMaquina,
  loading,
  error,
  procesos,
  centrosCosto,
  proveedores,
}: MaquinaTableProps) => {
  const nombre = (lista: SelectOption[], id: number) =>
    lista.find((x) => x.id === id)?.name ?? (id ? `ID ${id}` : '—');

  const columns: Columna<Maquina>[] = [
    {
      header: 'Código',
      render: (r) => codigoMaquina(r, procesos) ?? `ID ${r.id}`,
      className: 'w-28 font-medium whitespace-nowrap',
    },
    { header: 'Nombre', render: (r) => r.name, className: 'font-medium' },
    {
      header: 'Fabricante',
      render: (r) => r.fabricante || '—',
      className: 'hidden md:table-cell',
    },
    { header: 'Tipo', render: (r) => r.tipoDeMaquina || '—' },
    {
      header: 'N° Serie',
      render: (r) => r.numeroDeSerie || '—',
      className: 'hidden lg:table-cell',
    },
    {
      header: 'Centro de costo',
      render: (r) => nombre(centrosCosto, r.centroCosto_id),
      className: 'hidden md:table-cell',
    },
    {
      header: 'Proveedor',
      render: (r) => nombre(proveedores, r.proveedor_id),
      className: 'hidden lg:table-cell',
    },
  ];

  return (
    <ManagementTable
      rows={maquinas}
      columns={columns}
      onRowClick={onViewMaquina}
      loading={loading}
      error={error}
      emptyMessage="Todavía no hay máquinas registradas."
    />
  );
};
