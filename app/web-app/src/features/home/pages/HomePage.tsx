import { useAuth } from '../../../shared/contexts/AuthContext';
import { useTheme } from '../../../shared/contexts/ThemeContext';

export const HomePage = () => {
  const { logout } = useAuth();
  const { theme } = useTheme();

  return (
    <div
      className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-dark' : 'bg-light'}`}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1
            className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            Bienvenido a Jisa Maintenance
          </h1>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Cerrar Sesión
          </button>
        </div>
        <div
          className={`p-6 rounded-lg shadow ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <p className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
            Esta es la página principal de Jisa Maintenance. Aquí podrás
            gestionar todas las operaciones de mantenimiento.
          </p>
        </div>
      </div>
    </div>
  );
};
