import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaCog,
  FaSun,
  FaMoon,
  FaSignOutAlt,
  FaHome,
  FaChartBar,
  FaCogs,
  FaFileInvoiceDollar,
  FaChartLine,
  FaUserCircle,
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
      icon: <FaUserCircle size={16} />,
      text: 'Mi Perfil',
      onClick: () => {
        navigate('/profile');
        setOpenMenu(null);
      },
    },
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
  const iconColor = isDark ? colors.gold : colors.brown;
  const activeBg = isDark
    ? 'rgba(251, 175, 17, 0.12)'
    : 'rgba(158, 85, 51, 0.12)';
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

  // Ítem de la barra: ícono + etiqueta corta, mismo ancho para todos.
  const itemClass =
    'w-full flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-lg transition-colors';
  const itemStyle = (activo: boolean) => ({
    color: activo ? iconColor : textColor,
    backgroundColor: activo ? activeBg : 'transparent',
  });
  const labelClass =
    'text-[10.5px] leading-tight font-medium truncate max-w-full';

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
    const activo =
      isOpen || items.some((i) => location.pathname.startsWith(i.to));
    return (
      <li className="flex-1 min-w-0">
        <button
          type="button"
          onClick={() => setOpenMenu(isOpen ? null : menuKey)}
          className={itemClass}
          style={itemStyle(activo)}
          aria-expanded={isOpen}
        >
          <span style={{ color: iconColor }}>{icon}</span>
          <span className={labelClass}>{text}</span>
        </button>
      </li>
    );
  };

  // Submenú abierto: hoja inferior a todo el ancho (no se sale de pantalla).
  const menuAbierto: { titulo: string; items: NavLinkItem[] } | null =
    openMenu === 'gestion'
      ? { titulo: 'Gestión', items: managementItems }
      : openMenu === 'reportes'
        ? { titulo: 'Reportes contables', items: reportesContItems }
        : openMenu === 'kpis'
          ? { titulo: 'KPIs', items: kpis }
          : null;

  return (
    <nav
      ref={navRef}
      className="fixed bottom-0 left-0 w-full shadow-md z-30"
      style={{
        backgroundColor: navBgColor,
        borderTop: `1px solid ${borderColor}`,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {(menuAbierto || openMenu === 'settings') && (
        <div
          className="absolute bottom-full left-2 right-2 mb-2 max-h-[65vh] overflow-y-auto shadow-xl rounded-xl"
          style={{
            backgroundColor: menuBgColor,
            border: `1px solid ${borderColor}`,
          }}
        >
          <div
            className="px-4 pt-3 pb-2 text-xs font-semibold uppercase tracking-wide"
            style={{ color: iconColor }}
          >
            {menuAbierto ? menuAbierto.titulo : 'Ajustes'}
          </div>
          {menuAbierto
            ? menuAbierto.items.map((item) => (
                <DropdownLink key={item.to} item={item} />
              ))
            : settingsItems.map((item) => (
                <DropdownButton
                  key={item.text}
                  icon={item.icon}
                  text={item.text}
                  onClick={item.onClick}
                />
              ))}
        </div>
      )}
      <ul className="flex items-stretch gap-1 px-1.5 py-1.5">
        <li className="flex-1 min-w-0">
          <Link
            to="/home"
            className={itemClass}
            style={itemStyle(location.pathname === '/home')}
          >
            <span style={{ color: iconColor }}>
              <FaHome size={18} />
            </span>
            <span className={labelClass}>Inicio</span>
          </Link>
        </li>
        {canRoute('/dashboard') && (
          <li className="flex-1 min-w-0">
            <Link
              to="/dashboard"
              className={itemClass}
              style={itemStyle(location.pathname === '/dashboard')}
            >
              <span style={{ color: iconColor }}>
                <FaChartBar size={18} />
              </span>
              <span className={labelClass}>Panel</span>
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
        <li className="flex-1 min-w-0">
          <button
            type="button"
            onClick={() =>
              setOpenMenu(openMenu === 'settings' ? null : 'settings')
            }
            className={itemClass}
            style={itemStyle(openMenu === 'settings')}
            aria-expanded={openMenu === 'settings'}
          >
            <span style={{ color: iconColor }}>
              <FaCog size={18} />
            </span>
            <span className={labelClass}>Ajustes</span>
          </button>
        </li>
      </ul>
    </nav>
  );
};
