import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission, PermissionKey } from '../permissions/permissions';

export function usePermissions() {
  const { user } = useAuth();

  return useMemo(
    () => ({
      role: user?.cargo,
      can: (key: PermissionKey) => hasPermission(user?.cargo, key),
    }),
    [user],
  );
}
