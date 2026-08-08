import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { getRequiredPermission } from '../../permissions/routePermissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { can } = usePermissions();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const requiredPermission = getRequiredPermission(location.pathname);
  if (requiredPermission && !can(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-3">🔒</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Acceso denegado</h1>
          <p className="text-sm text-gray-500 mb-5">
            Tu rol no tiene permiso para ver esta sección.
          </p>
          <Link
            to="/home"
            className="inline-block px-4 py-2 rounded-md text-sm font-semibold"
            style={{ background: '#FBAF11', color: '#1A1A1A' }}
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
