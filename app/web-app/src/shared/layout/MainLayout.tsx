import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { BottomNav } from '../components/BottomNav';
import { useTheme } from '../../core/context/ThemeContext';

export const MainLayout = () => {
  const { isDarkMode } = useTheme();

  return (
    <div
      className={`min-h-screen flex ${isDarkMode ? 'bg-background-dark' : 'bg-background-light'}`}
    >
      {/* Sidebar - Solo visible en desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>

        {/* Bottom Navigation - Solo visible en mobile */}
        <nav
          className={`block md:hidden ${
            isDarkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          } border-t`}
        >
          <BottomNav />
        </nav>
      </div>
    </div>
  );
};
