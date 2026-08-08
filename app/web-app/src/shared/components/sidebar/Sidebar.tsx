import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FaHome,
  FaChartBar,
  FaChevronLeft,
  FaChevronRight,
  FaUserCircle,
  FaSignOutAlt,
  FaSun,
  FaMoon,
  FaCog,
  FaChartLine,
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { usePermissions } from '../../hooks/usePermissions';
import { getRequiredPermission } from '../../permissions/routePermissions';
import {
  MANAGEMENT_ITEMS,
  REPORTES_CONT_ITEMS,
  KPI_ITEMS,
} from '../../navigation/navConfig';
import { NavItem } from './components/NavItem';
import { ActionItem } from './components/ActionItem';

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  // Solo un submenú (Gestión / Reportes Contables / KPIs) puede estar
  // abierto a la vez, para que no se superpongan entre sí.
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { can } = usePermissions();
  const canRoute = (to: string) => {
    const perm = getRequiredPermission(to);
    return !perm || can(perm);
  };

  // Cierra el submenú abierto al navegar o al hacer clic fuera del sidebar.
  useEffect(() => {
    setOpenMenu(null);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Paleta de colores definida por el cliente
  const colors = {
    brown: '#9E5533',
    beige: '#E1CD9B',
    gold: '#FBAF11',
    darkBg: '#1A1A1A',
    lightBg: '#E6E6E6',
    darkText: '#000000',
    lightText: '#FFFFFF',
    darkHover: '#9E5533',
    lightHover: '#FBAF11',
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const managementItems = MANAGEMENT_ITEMS.filter((item) => canRoute(item.to));
  const reportesContItems = REPORTES_CONT_ITEMS.filter((item) =>
    canRoute(item.to),
  );
  const kpis = KPI_ITEMS.filter((item) => canRoute(item.to));

  // Definir colores para Sidebar basados en el tema
  const sidebarBg = theme === 'dark' ? colors.darkBg : colors.lightBg;
  const profileIconColor = theme === 'dark' ? colors.beige : colors.brown;
  const toggleButtonBg = theme === 'dark' ? colors.brown : colors.gold;
  const toggleButtonColor =
    theme === 'dark' ? colors.lightText : colors.darkText;
  const borderColor =
    theme === 'dark' ? `${colors.brown}40` : `${colors.gold}40`;

  return (
    <div
      ref={sidebarRef}
      className={`relative h-full transition-width duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-52'
      }`}
    >
      {/* Sidebar principal con posición fija y colores de tema */}
      <aside
        className={`fixed z-30 h-full p-4 rounded-r-xl shadow-md flex flex-col transition-colors duration-300 ease-in-out ${theme === 'dark' ? 'border-r-1 border-brown shadow-lg' : 'border-r-1 border-gold shadow-lg'}`}
        style={{ backgroundColor: sidebarBg }}
      >
        {/* Sección Perfil y Botón Colapsar */}
        <div className="relative mb-8 flex justify-center">
          {/* Icono de perfil */}
          <div className="flex items-center justify-center">
            <FaUserCircle
              className="w-[36px] h-[36px] transition-colors duration-300"
              style={{ color: profileIconColor }}
            />
          </div>
          {/* Botón para colapsar/expandir */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-6 top-1/2 transform -translate-y-1/2 w-[24px] h-[24px] rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              backgroundColor: toggleButtonBg,
              color: toggleButtonColor,
            }}
            aria-label={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            {isCollapsed ? (
              <FaChevronRight className="w-3 h-3" />
            ) : (
              <FaChevronLeft className="w-3 h-3" />
            )}
          </button>
        </div>

        {/* Navegación Principal */}
        {/* El scroll solo se activa con el sidebar expandido: cuando está
            colapsado, los submenús se muestran como flyouts posicionados
            fuera del nav (left-full) y un overflow acá los recortaría. */}
        <nav
          className={`space-y-2 flex-1 min-h-0 ${isCollapsed ? '' : 'overflow-y-auto overflow-x-hidden'}`}
        >
          {/* --- Inicio --- */}
          <NavItem
            to="/home"
            icon={<FaHome />}
            text="Inicio"
            isCollapsed={isCollapsed}
            colors={colors}
            theme={theme}
          />
          {/* --- Dashboard --- */}
          {canRoute('/dashboard') && (
            <NavItem
              to="/dashboard"
              icon={<FaChartBar />}
              text="Dashboard"
              isCollapsed={isCollapsed}
              colors={colors}
              theme={theme}
            />
          )}
          {/* --- Gestión (con submenú) --- */}
          {managementItems.length > 0 && (
            <NavItem
              icon={<FaCog />}
              text="Gestión"
              isCollapsed={isCollapsed}
              isActive={location.pathname.startsWith('/management')}
              nestedItems={managementItems}
              isOpen={openMenu === 'gestion'}
              onToggle={() =>
                setOpenMenu((prev) => (prev === 'gestion' ? null : 'gestion'))
              }
              colors={colors}
              theme={theme}
            />
          )}

          {/* --- Reportes Contables (con submenú) --- */}
          {reportesContItems.length > 0 && (
            <NavItem
              icon={<FaChartBar />}
              text="Reportes Contables"
              isCollapsed={isCollapsed}
              isActive={location.pathname.startsWith('/reportes')}
              nestedItems={reportesContItems}
              isOpen={openMenu === 'reportes'}
              onToggle={() =>
                setOpenMenu((prev) => (prev === 'reportes' ? null : 'reportes'))
              }
              colors={colors}
              theme={theme}
            />
          )}
          {/* --- KPIs (con submenú) --- */}
          {kpis.length > 0 && (
            <NavItem
              icon={<FaChartLine />}
              text="KPIs"
              isCollapsed={isCollapsed}
              isActive={location.pathname.startsWith('/kpis')}
              nestedItems={kpis}
              isOpen={openMenu === 'kpis'}
              onToggle={() =>
                setOpenMenu((prev) => (prev === 'kpis' ? null : 'kpis'))
              }
              colors={colors}
              theme={theme}
            />
          )}
        </nav>

        {/* Acciones Inferiores */}
        <div
          className="space-y-2 pt-4 transition-colors duration-300"
          style={{ borderTop: `1px solid ${borderColor}` }}
        >
          <ActionItem
            icon={theme === 'dark' ? <FaSun /> : <FaMoon />}
            text={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
            onClick={toggleTheme}
            isCollapsed={isCollapsed}
            colors={colors}
            theme={theme}
          />
          <ActionItem
            icon={<FaSignOutAlt />}
            text="Cerrar Sesión"
            onClick={handleLogout}
            isCollapsed={isCollapsed}
            colors={colors}
            theme={theme}
          />
        </div>
      </aside>
    </div>
  );
};
