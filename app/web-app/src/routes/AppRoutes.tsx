import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../shared/layout/MainLayout';
import { AuthLayout } from '../shared/layout/AuthLayout';
import { ProtectedRoute } from '../shared/components/auth/ProtectedRoute';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { HomePage } from '../features/home/pages/HomePage';
import { UserManagementPage } from '../features/user-management/pages/UsManagmentPage';
import { CoCeManagement } from '../features/cost-center-management/page/CoCeManagementPage';
import { DepartamentoPage } from '../features/departamento/page/departamentoPage';
import { MaquinaPage } from '../features/maquina/page/maquinaPage';
import { ObjetoPage } from '../features/objeto/page/objetoPage';
import { OtPage } from '../features/ot/page/otPage';
import { ProcessPage } from '../features/process/page/processPage';
import { ProovedoresPage } from '../features/proveedores-management/page/proovedoresPage';
import { RepuestoPage } from '../features/repuesto/page/repuestoPage';
import { RepuestoMaquinaPage } from '../features/repuesto-maquina/page/repuestoMaquinaPage';
import { SubUnidadPage } from '../features/subUnidad/page/subUnidadPage';
import { TipoMantenimientoPage } from '../features/tipoMantenimiento/page/tipoMantenimientoPage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Rutas protegidas */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/home" element={<HomePage />} />
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/management/users" element={<UserManagementPage />} />
        <Route path="/management/cost-centers" element={<CoCeManagement />} />
        <Route path="/departamento" element={<DepartamentoPage />} />
        <Route path="/maquina" element={<MaquinaPage />} />
        <Route path="/objeto" element={<ObjetoPage />} />
        <Route path="/ot" element={<OtPage />} />
        <Route path="/process" element={<ProcessPage />} />
        <Route path="/proveedores" element={<ProovedoresPage />} />
        <Route path="/repuesto" element={<RepuestoPage />} />
        <Route path="/repuesto-maquina" element={<RepuestoMaquinaPage />} />
        <Route path="/subunidad" element={<SubUnidadPage />} />
        <Route path="/tipo-mantenimiento" element={<TipoMantenimientoPage />} />
      </Route>

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
