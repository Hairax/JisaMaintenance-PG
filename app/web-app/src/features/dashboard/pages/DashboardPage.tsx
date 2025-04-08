import { useAuth } from '../../../core/context/AuthContext';

export const DashboardPage = () => {
  const { logout } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Cerrar Sesión
        </button>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <p>Bienvenido al dashboard principal</p>
      </div>
    </div>
  );
};
