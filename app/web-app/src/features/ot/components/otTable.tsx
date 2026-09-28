import { OrdenTrabajo } from '../types/ot.types';
import {
  Columna,
  ManagementTable,
} from '../../../shared/components/management/ManagementTable';
import { Badge } from '../../../shared/components/management/Badge';
import { fmtFecha, toneEstadoOt } from '../../../shared/utils/format';

interface OtTableProps {
  ots: OrdenTrabajo[];
  onViewOt: (row: OrdenTrabajo) => void;
  loading: boolean;
  error: string | null;
  tiposMantenimiento: { id: number; nombre: string }[];
  centrosCosto: { id: number; nombre: string }[];
}

export const OtTable = ({
  ots,
  onViewOt,
  loading,
  error,
  tiposMantenimiento,
  centrosCosto,
}: OtTableProps) => {
  const getTipoOTNombre = (id?: number) =>
    tiposMantenimiento.find((t) => t.id === id)?.nombre;
  const getCentroCostoNombre = (id?: number) =>
    centrosCosto.find((c) => c.id === id)?.nombre;

  const columns: Columna<OrdenTrabajo>[] = [
    {
      header: 'N° OT',
      render: (r) => `#${r.id}`,
      className: 'w-20 font-semibold',
    },
    {
      header: 'Descripción',
      render: (r) => (
        <div className="max-w-md">
          <div className="font-medium truncate">
            {r.descripcionTarea || '—'}
          </div>
          <div
            className="text-xs truncate"
            style={{ color: 'var(--app-text-subtle)' }}
          >
            {r.maquina?.name ?? r.maquina?.nombre ?? 'Sin máquina'}
          </div>
        </div>
      ),
    },
    {
      header: 'Tipo',
      render: (r) => r.tipoOT?.nombre ?? getTipoOTNombre(r.tipoOT_id) ?? '—',
    },
    {
      header: 'Centro de costo',
      render: (r) =>
        r.costCenter?.name ?? getCentroCostoNombre(r.centroCosto_id) ?? '—',
      className: 'hidden md:table-cell',
    },
    {
      header: 'Estado',
      render: (r) => (
        <Badge tone={toneEstadoOt(r.estado)}>{r.estado ?? '—'}</Badge>
      ),
    },
    {
      header: 'Fecha',
      render: (r) => fmtFecha(r.fechaHora),
      className: 'whitespace-nowrap',
    },
  ];

  return (
    <ManagementTable
      rows={ots}
      columns={columns}
      onRowClick={onViewOt}
      loading={loading}
      error={error}
      emptyMessage="Todavía no hay órdenes de trabajo registradas."
    />
  );
};
