import { useAuth } from '../../../core/context/AuthContext';
import { useTheme } from '../../../core/context/ThemeContext';

export const DashboardPage = () => {
  const { logout } = useAuth();
  const { isDarkMode } = useTheme();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1
          className={`text-2xl font-bold ${
            isDarkMode ? 'text-text-dark' : 'text-text-light'
          }`}
        >
          Dashboard
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
          isDarkMode ? 'bg-background-dark' : 'bg-background-light'
        }`}
      >
        <p className={isDarkMode ? 'text-text-dark' : 'text-text-light'}>
          Bienvenido al dashboard principal
        </p>
      </div>
    </div>
  );
};
