import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  FaFileInvoiceDollar,
  FaChartLine,
} from 'react-icons/fa';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { useAuth } from '../../shared/contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { getRequiredPermission } from '../permissions/routePermissions';
import {
  MANAGEMENT_ITEMS,
  REPORTES_CONT_ITEMS,
  KPI_ITEMS,
  NavLinkItem,
} from '../navigation/navConfig';

type MenuKey = 'gestion' | 'reportes' | 'kpis' | 'settings';

export const BottomNav = () => {
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const { can } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const canRoute = (to: string) => {
    const perm = getRequiredPermission(to);
    return !perm || can(perm);
  };

  const isDark = theme === 'dark';

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

  const managementItems = MANAGEMENT_ITEMS.filter((item) => canRoute(item.to));
  const reportesContItems = REPORTES_CONT_ITEMS.filter((item) =>
    canRoute(item.to),
  );
  const kpis = KPI_ITEMS.filter((item) => canRoute(item.to));

  const settingsItems = [
    {
      icon: isDark ? <FaSun size={16} /> : <FaMoon size={16} />,
      text: isDark ? 'Modo Claro' : 'Modo Oscuro',
      onClick: () => {
        toggleTheme();
        setOpenMenu(null);
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

  // Cierra el desplegable abierto al navegar o al tocar fuera del menú.
  useEffect(() => {
    setOpenMenu(null);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Estilo de navegación base en función del tema
  const navBgColor = isDark ? colors.darkBg : colors.lightBg;
  const textColor = isDark ? colors.lightText : colors.darkText;
  const menuBgColor = isDark ? colors.darkBg : colors.beige;
  const borderColor = isDark ? `${colors.brown}40` : `${colors.brown}40`;
  const iconColor = colors.brown;
  // Color de hover de los ítems dentro de los desplegables, coherente en
  // ambos temas (antes era un gris claro fijo, invisible/feo en modo oscuro).
  const dropdownHoverBg = isDark ? `${colors.brown}40` : `${colors.gold}30`;

  const DropdownLink = ({ item }: { item: NavLinkItem }) => (
    <Link
      to={item.to}
      className="block px-4 py-2 text-sm transition-colors duration-150"
      style={{ color: textColor }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = dropdownHoverBg;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {item.text}
    </Link>
  );

  const DropdownButton = ({
    icon,
    text,
    onClick,
  }: {
    icon: React.ReactNode;
    text: string;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className="block px-4 py-2 text-sm w-full text-left flex items-center gap-2 transition-colors duration-150"
      style={{ color: textColor }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = dropdownHoverBg;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {icon}
      {text}
    </button>
  );

  const MenuTrigger = ({
    menuKey,
    icon,
    text,
    items,
  }: {
    menuKey: MenuKey;
    icon: React.ReactNode;
    text: string;
    items: NavLinkItem[];
  }) => {
    if (items.length === 0) return null;
    const isOpen = openMenu === menuKey;
    return (
      <li className="relative">
        <button
          onClick={() => setOpenMenu(isOpen ? null : menuKey)}
          className="flex flex-col items-center py-1"
          style={{ color: textColor }}
        >
          <span style={{ color: iconColor }}>{icon}</span>
          <span className="mt-1 flex items-center">
            {text}
            {isOpen ? (
              <FaChevronUp className="ml-1" size={12} />
            ) : (
              <FaChevronDown className="ml-1" size={12} />
            )}
          </span>
        </button>
        {isOpen && (
          <div
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-[220px] max-h-[60vh] overflow-y-auto shadow-lg rounded-lg overflow-hidden"
            style={{
              backgroundColor: menuBgColor,
              border: `1px solid ${borderColor}`,
            }}
          >
            {items.map((item) => (
              <DropdownLink key={item.to} item={item} />
            ))}
          </div>
        )}
      </li>
    );
  };

  return (
    <nav
      ref={navRef}
      className="fixed bottom-0 left-0 w-full shadow-md z-30"
      style={{
        backgroundColor: navBgColor,
        borderTop: `1px solid ${borderColor}`,
      }}
    >
      <ul className="flex justify-around text-sm py-2">
        <li>
          <Link
            to="/home"
            className="flex flex-col items-center py-1"
            style={{ color: textColor }}
          >
            <span style={{ color: iconColor }}>
              <FaHome size={18} />
            </span>
            <span className="mt-1">Inicio</span>
          </Link>
        </li>
        {canRoute('/dashboard') && (
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
        )}
        <MenuTrigger
          menuKey="gestion"
          icon={<FaCogs size={18} />}
          text="Gestión"
          items={managementItems}
        />
        <MenuTrigger
          menuKey="reportes"
          icon={<FaFileInvoiceDollar size={18} />}
          text="Reportes"
          items={reportesContItems}
        />
        <MenuTrigger
          menuKey="kpis"
          icon={<FaChartLine size={18} />}
          text="KPIs"
          items={kpis}
        />
        <li className="relative">
          <button
            onClick={() =>
              setOpenMenu(openMenu === 'settings' ? null : 'settings')
            }
            className="flex flex-col items-center py-1"
            style={{ color: textColor }}
          >
            <span style={{ color: iconColor }}>
              <FaCog size={18} />
            </span>
            <span className="mt-1 flex items-center">Configuración</span>
          </button>
          {openMenu === 'settings' && (
            <div
              className="absolute bottom-full right-0 mb-2 w-[200px] shadow-lg rounded-lg overflow-hidden"
              style={{
                backgroundColor: menuBgColor,
                border: `1px solid ${borderColor}`,
              }}
            >
              {settingsItems.map((item) => (
                <DropdownButton
                  key={item.text}
                  icon={item.icon}
                  text={item.text}
                  onClick={item.onClick}
                />
              ))}
            </div>
          )}
        </li>
      </ul>
    </nav>
  );
};
