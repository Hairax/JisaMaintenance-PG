import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/sidebar/Sidebar';
import { BottomNav } from '../components/BottomNav';
import { useTheme } from '../contexts/ThemeContext';
import { colors } from '../types/colors';

export const MainLayout = () => {
  const { theme } = useTheme();
  const bottomNavHeightClass = 'pb-16';

  // Usar los colores de fondo de la paleta
  const layoutBgColor = theme === 'dark' ? colors.darkBg : colors.lightBg;

  return (
    <div
      className="min-h-screen flex transition-colors duration-300"
      style={{ backgroundColor: layoutBgColor }}
    >
      {/* Sidebar - Solo visible en desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Contenido Principal */}
        <main
          className={`flex-1 overflow-y-auto p-4 md:p-6 ${bottomNavHeightClass} md:pb-6`}
        >
          {/* Para resaltar visualmente el contenido principal */}
          <div
            className="h-full rounded-lg"
            style={{
              backgroundColor:
                theme === 'dark'
                  ? 'rgba(225, 205, 155, 0.05)'
                  : 'rgba(158, 85, 51, 0.05)',
              boxShadow:
                theme === 'dark'
                  ? 'none'
                  : '0 2px 10px rgba(158, 85, 51, 0.05)',
            }}
          >
            <Outlet />
          </div>
        </main>

        {/* Bottom Navigation Wrapper - Solo visible en mobile */}
        <div className="block md:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
};
