import { User } from '../../../shared/types/user.types';
import {
  Columna,
  ManagementTable,
} from '../../../shared/components/management/ManagementTable';
import { Badge } from '../../../shared/components/management/Badge';
import { ROLE_LABELS } from '../../../shared/permissions/permissions';

interface UserTableProps {
  users: User[];
  onViewUser: (row: User) => void;
  loading: boolean;
  error: string | null;
}

export const UserTable = ({
  users,
  onViewUser,
  loading,
  error,
}: UserTableProps) => {
  const columns: Columna<User>[] = [
    { header: 'ID', render: (r) => r.id, className: 'w-20 font-medium' },
    {
      header: 'Nombre',
      render: (r) => (
        <div>
          <div className="font-medium">
            {r.name} {r.lastName}
          </div>
          <div className="text-xs" style={{ color: 'var(--app-text-subtle)' }}>
            @{r.userName}
          </div>
        </div>
      ),
    },
    {
      header: 'Email',
      render: (r) => r.email || '—',
      className: 'hidden md:table-cell',
    },
    { header: 'Cargo', render: (r) => ROLE_LABELS[r.cargo] ?? r.cargo },
    {
      header: 'Estado',
      render: (r) => (
        <Badge tone={r.status ? 'success' : 'danger'}>
          {r.status ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
  ];

  return (
    <ManagementTable
      rows={users}
      columns={columns}
      onRowClick={onViewUser}
      loading={loading}
      error={error}
      emptyMessage="Todavía no hay usuarios registrados."
      rowStyle={(r) => (r.status ? undefined : { opacity: 0.6 })}
    />
  );
};
