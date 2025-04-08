import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  FaHome,
  FaChartBar,
  FaChevronLeft,
  FaChevronRight,
  FaUserCircle,
  FaSignOutAlt,
  FaSun,
  FaMoon,
} from 'react-icons/fa';
import { useAuth } from '../../core/context/AuthContext';
import { useTheme } from '../../core/context/ThemeContext';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  text: string;
  isCollapsed: boolean;
  isActive: boolean;
}

const NavItem = ({ to, icon, text, isCollapsed, isActive }: NavItemProps) => (
  <NavLink
    to={to}
    className={`flex items-center ${
      isCollapsed ? 'justify-center' : 'justify-start'
    } h-[42px] rounded-lg transition-all duration-200 ${
      isActive
        ? 'bg-[#3C2729] bg-opacity-70'
        : 'hover:bg-[#3C2729] hover:bg-opacity-70'
    }`}
  >
    <div className="w-[42px] flex items-center justify-center">
      <div className="w-[18px] h-[18px] text-white">{icon}</div>
    </div>
    {!isCollapsed && <span className="text-white ml-2">{text}</span>}
  </NavLink>
);

const ActionItem = ({
  icon,
  text,
  onClick,
  isCollapsed,
}: {
  icon: React.ReactNode;
  text: string;
  onClick: () => void;
  isCollapsed: boolean;
}) => (
  <button
    onClick={onClick}
    className="flex items-center w-full h-[42px] rounded-lg transition-all duration-200 hover:bg-[#3C2729] hover:bg-opacity-70"
  >
    <div className="w-[42px] flex items-center justify-center">
      <div className="w-[18px] h-[18px] text-white">{icon}</div>
    </div>
    {!isCollapsed && <span className="text-white ml-2">{text}</span>}
  </button>
);

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div
      className={`relative h-full transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-40'
      }`}
    >
      <aside className="fixed h-full bg-[#0F090C] bg-opacity-50 p-4 rounded-r-[21px] flex flex-col">
        {/* Profile and Toggle Button */}
        <div className="relative mb-8 flex justify-center">
          <div className="flex items-center justify-center">
            <FaUserCircle className="w-[36px] h-[36px] text-white" />
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-5 top-2 w-[18px] h-[18px] rounded-full bg-[#3C2729] bg-opacity-70 text-white hover:bg-opacity-100 transition-all duration-200 flex items-center justify-center"
          >
            {isCollapsed ? (
              <FaChevronRight className="w-3 h-3" />
            ) : (
              <FaChevronLeft className="w-3 h-3" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-4 flex-1">
          <NavItem
            to="/home"
            icon={<FaHome />}
            text="Inicio"
            isCollapsed={isCollapsed}
            isActive={location.pathname === '/home'}
          />
          <NavItem
            to="/dashboard"
            icon={<FaChartBar />}
            text="Dashboard"
            isCollapsed={isCollapsed}
            isActive={location.pathname === '/dashboard'}
          />
        </nav>

        {/* Bottom Actions */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <ActionItem
            icon={isDarkMode ? <FaSun /> : <FaMoon />}
            text={isDarkMode ? 'Claro' : 'Oscuro'}
            onClick={toggleTheme}
            isCollapsed={isCollapsed}
          />
          <ActionItem
            icon={<FaSignOutAlt />}
            text="Salir"
            onClick={handleLogout}
            isCollapsed={isCollapsed}
          />
        </div>
      </aside>
    </div>
  );
};
