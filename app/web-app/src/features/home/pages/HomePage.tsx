import { useAuth } from '../../../core/context/AuthContext';

export const HomePage = () => {
  const { logout } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenido a Jisa Maintenance
        </h1>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Cerrar Sesión
        </button>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-700">
          Esta es la página principal de Jisa Maintenance. Aquí podrás gestionar
          todas las operaciones de mantenimiento.
        </p>
      </div>
    </div>
  );
};
