import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaCog,
  FaChevronUp,
  FaChevronDown,
  FaSun,
  FaMoon,
  FaSignOutAlt,
} from 'react-icons/fa';
import { useTheme } from '../../core/context/ThemeContext';
import { useAuth } from '../../core/context/AuthContext';

type Props = { className?: string };

export const BottomNav = ({ className }: Props) => {
  const [showManagement, setShowManagement] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const managementItems = [
    { to: '/management/users', text: 'Usuarios' },
    { to: '/management/assets', text: 'Activos' },
    { to: '/management/work-orders', text: 'Órdenes de Trabajo' },
  ];

  const settingsItems = [
    {
      icon: isDarkMode ? <FaSun /> : <FaMoon />,
      onClick: () => {
        toggleTheme();
        setShowSettings(false);
      },
    },
    {
      icon: <FaSignOutAlt />,
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  return (
    <nav
      className={`${className} fixed bottom-0 left-0 w-full ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } shadow-md z-50`}
    >
      <ul className="flex justify-around text-sm py-2">
        <li>
          <Link
            to="/"
            className={`flex flex-col items-center ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}
          >
            <span>🏠</span>Inicio
          </Link>
        </li>
        <li>
          <Link
            to="/dashboard"
            className={`flex flex-col items-center ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}
          >
            <span>📊</span>Dashboard
          </Link>
        </li>
        <li className="relative">
          <button
            onClick={() => setShowManagement(!showManagement)}
            className={`flex flex-col items-center ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}
          >
            <span>
              <FaCog />
            </span>
            Gestión
            {showManagement ? (
              <FaChevronUp className="mt-1" />
            ) : (
              <FaChevronDown className="mt-1" />
            )}
          </button>
          {showManagement && (
            <div
              className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-[150px] ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              } shadow-lg rounded-lg overflow-hidden border ${
                isDarkMode ? 'border-gray-700' : 'border-gray-100'
              }`}
            >
              <div className="py-2">
                {managementItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`block py-3 px-4 text-sm ${
                      isDarkMode
                        ? 'text-gray-200 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    } transition-colors duration-150`}
                  >
                    {item.text}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </li>
        <li className="relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex flex-col items-center ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}
          >
            <span>⚙️</span>
            Ajustes
            {showSettings ? (
              <FaChevronUp className="mt-1" />
            ) : (
              <FaChevronDown className="mt-1" />
            )}
          </button>
          {showSettings && (
            <div
              className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-auto ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              } shadow-lg rounded-lg overflow-hidden border ${
                isDarkMode ? 'border-gray-700' : 'border-gray-100'
              }`}
            >
              <div className="py-2">
                {settingsItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={item.onClick}
                    className={`flex items-center w-full py-3 px-4 text-sm ${
                      isDarkMode
                        ? 'text-gray-200 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    } transition-colors duration-150`}
                  >
                    <span className="mr-2">{item.icon}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </li>
      </ul>
    </nav>
  );
};
