import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { BottomNav } from '../components/BottomNav';

export const MainLayout = () => {
  return (
    <div className="min-h-screen flex bg-gray-100">
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
        <nav className="block md:hidden bg-white border-t border-gray-200">
          <BottomNav />
        </nav>
      </div>
    </div>
  );
};
