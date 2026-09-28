import { CostCenter } from '../../../shared/types/cost-center.types';
import {
  Columna,
  ManagementTable,
} from '../../../shared/components/management/ManagementTable';

interface CoCeTableProps {
  costCenters: CostCenter[];
  onViewCostCenter: (row: CostCenter) => void;
  loading: boolean;
  error: string | null;
}

export const CoCeTable = ({
  costCenters,
  onViewCostCenter,
  loading,
  error,
}: CoCeTableProps) => {
  const columns: Columna<CostCenter>[] = [
    { header: 'ID', render: (r) => r.id, className: 'w-20 font-medium' },
    { header: 'Nombre', render: (r) => r.name, className: 'font-medium' },
  ];

  return (
    <ManagementTable
      rows={costCenters}
      columns={columns}
      onRowClick={onViewCostCenter}
      loading={loading}
      error={error}
      emptyMessage="Todavía no hay centros de costo registrados."
    />
  );
};
