import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../shared/layout/MainLayout';
import { AuthLayout } from '../shared/layout/AuthLayout';
import { ProtectedRoute } from '../shared/components/auth/ProtectedRoute';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { HomePage } from '../features/home/pages/HomePage';

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
      </Route>

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
