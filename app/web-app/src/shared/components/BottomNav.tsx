import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaCog,
  FaChevronUp,
  FaChevronDown,
  FaSun,
  FaMoon,
  FaSignOutAlt,
  FaHome,
  FaChartBar,
  FaCogs,
} from 'react-icons/fa';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { useAuth } from '../../shared/contexts/AuthContext';

export const BottomNav = () => {
  const [showManagement, setShowManagement] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Paleta de colores definida por el cliente
  const colors = {
    brown: '#9E5533',
    beige: '#E1CD9B',
    gold: '#FBAF11',
    darkBg: '#1A1A1A',
    lightBg: '#E6E6E6',
    darkText: '#000000',
    lightText: '#FFFFFF',
  };

  const managementItems = [
    { to: '/management/users', text: 'Usuarios' },
    { to: '/management/assets', text: 'Activos' },
    { to: '/management/work-orders', text: 'Órdenes de Trabajo' },
  ];

  const settingsItems = [
    {
      icon: theme === 'dark' ? <FaSun size={16} /> : <FaMoon size={16} />,
      text: theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro',
      onClick: () => {
        toggleTheme();
        setShowSettings(false);
      },
    },
    {
      icon: <FaSignOutAlt size={16} />,
      text: 'Cerrar Sesión',
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  // Estilo de navegación base en función del tema
  const navBgColor = theme === 'dark' ? colors.darkBg : colors.lightBg;
  const textColor = theme === 'dark' ? colors.lightText : colors.darkText;
  const menuBgColor = theme === 'dark' ? colors.darkBg : colors.beige;
  const borderColor =
    theme === 'dark' ? `${colors.brown}40` : `${colors.brown}40`;
  const iconColor = colors.brown;

  return (
    <nav
      className="fixed bottom-0 left-0 w-full shadow-md z-50"
      style={{
        backgroundColor: navBgColor,
        borderTop: `1px solid ${borderColor}`,
      }}
    >
      <ul className="flex justify-around text-sm py-2">
        <li>
          <Link
            to="/"
            className="flex flex-col items-center py-1"
            style={{ color: textColor }}
          >
            <span style={{ color: iconColor }}>
              <FaHome size={18} />
            </span>
            <span className="mt-1">Inicio</span>
          </Link>
        </li>
        <li>
          <Link
            to="/dashboard"
            className="flex flex-col items-center py-1"
            style={{ color: textColor }}
          >
            <span style={{ color: iconColor }}>
              <FaChartBar size={18} />
            </span>
            <span className="mt-1">Dashboard</span>
          </Link>
        </li>
        <li className="relative">
          <button
            onClick={() => setShowManagement(!showManagement)}
            className="flex flex-col items-center py-1"
            style={{ color: textColor }}
          >
            <span style={{ color: iconColor }}>
              <FaCogs size={18} />
            </span>
            <span className="mt-1 flex items-center">
              Gestión
              {showManagement ? (
                <FaChevronUp className="ml-1" size={12} />
              ) : (
                <FaChevronDown className="ml-1" size={12} />
              )}
            </span>
          </button>
          {showManagement && (
            <div
              className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-[200px] shadow-lg rounded-lg overflow-hidden"
              style={{
                backgroundColor: menuBgColor,
                border: `1px solid ${borderColor}`,
              }}
            >
              {managementItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                  style={{ color: textColor }}
                >
                  {item.text}
                </Link>
              ))}
            </div>
          )}
        </li>
        <li className="relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex flex-col items-center py-1"
            style={{ color: textColor }}
          >
            <span style={{ color: iconColor }}>
              <FaCog size={18} />
            </span>
            <span className="mt-1 flex items-center">Configuración</span>
          </button>
          {showSettings && (
            <div
              className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-[200px] shadow-lg rounded-lg overflow-hidden"
              style={{
                backgroundColor: menuBgColor,
                border: `1px solid ${borderColor}`,
              }}
            >
              {settingsItems.map((item) => (
                <button
                  key={item.text}
                  onClick={item.onClick}
                  className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 w-full text-left"
                  style={{ color: textColor }}
                >
                  {item.text}
                </button>
              ))}
            </div>
          )}
        </li>
      </ul>
    </nav>
  );
};
