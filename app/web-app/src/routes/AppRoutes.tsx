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
import { InformePage } from '../features/informe/page/informePage';
import RegisterInformePage from '../features/informe/page/registerInformePage';
import ListInformePage from '../features/informe/page/listInformePage';
import KardexValoradoPage from '../features/reportesCont/KardexValoradoPage';
import CostosMantenimientoPage from '../features/reportesCont/CostosMantenimientoPage';
import CostosOrdenesTrabajoPage from '../features/reportesCont/CostosOrdenesTrabajoPage';
import ComprasMaterialesPage from '../features/reportesCont/ComprasMaterialesPage';
import ConsumoMaterialesPage from '../features/reportesCont/ConsumoMaterialesPage';
import TomaFisicaInventarioPage from '../features/reportesCont/TomaFisicaInventarioPage';
import MantenimientoPorActivoPage from '../features/reportesCont/MantenimientoPorActivoPage';
import BiDashboardPage from '../features/web-app/src/features/bi/page/BiDashboardPage';
import DisponibilidadPage from '../features/kpis/Disponibilidad';
import TMEFPage from '../features/kpis/TMEFPage';
import TMPRPage from '../features/kpis/TMPRPage';
import KPICostoPorActivo from '../features/kpis/KPICostoPorActivo';
import CompraInventarioPage from '../features/Compra/page/compraPage';
import { ListCompraPage } from '../features/Compra/page/listCompraPage';
import SalidaPage from '../features/Salida/page/salidaPage';
import { ListSalidaPage } from '../features/Salida/page/listSalidaPage';

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
        <Route path="/dashboard" element={<BiDashboardPage />} />
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
        <Route path="/informe" element={<InformePage />} />
        <Route path="/informes" element={<ListInformePage />} />
        <Route path="/informes/registrar" element={<RegisterInformePage />} />
        <Route path="/compras" element={<ListCompraPage />} />
        <Route path="/compras/crear" element={<CompraInventarioPage />} />
        <Route path="/salidas" element={<ListSalidaPage />} />
        <Route path="/salidas/registrar" element={<SalidaPage />} />

        {/* Ruta para reportes contables */}
        <Route path="/reportes/kardex" element={<KardexValoradoPage />} />
        <Route path="/reportes/costos" element={<CostosMantenimientoPage />} />
        <Route
          path="/reportes/costos-ordenes-trabajo"
          element={<CostosOrdenesTrabajoPage />}
        />
        <Route
          path="/reportes/compras-materiales"
          element={<ComprasMaterialesPage />}
        />
        <Route
          path="/reportes/consumo-materiales"
          element={<ConsumoMaterialesPage />}
        />
        <Route
          path="/reportes/tomas-inventario"
          element={<TomaFisicaInventarioPage />}
        />
        <Route
          path="/reportes/mantenimiento-activo"
          element={<MantenimientoPorActivoPage />}
        />

        <Route path="/kpis/disponibilidad" element={<DisponibilidadPage />} />
        <Route path="/kpis/tmef" element={<TMEFPage />} />
        <Route path="/kpis/tmpr" element={<TMPRPage />} />
        <Route path="/kpis/costo-por-activo" element={<KPICostoPorActivo />} />
      </Route>

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
