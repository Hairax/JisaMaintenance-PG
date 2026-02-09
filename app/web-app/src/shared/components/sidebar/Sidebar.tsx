import { useState } from 'react';
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
import { NavItem } from './components/NavItem';
import { ActionItem } from './components/ActionItem';

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

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

  const managementItems = [
    { to: '/management/users', text: 'Usuarios' },
    { to: '/management/cost-centers', text: 'Centros de Costos' },
    { to: '/departamento', text: 'Departamentos' },
    { to: '/maquina', text: 'Máquinas' },
    { to: '/objeto', text: 'Objetos' },
    { to: '/ot', text: 'Órdenes de Trabajo' },
    { to: '/process', text: 'Procesos' },
    { to: '/proveedores', text: 'Proveedores' },
    { to: '/repuesto', text: 'Repuestos' },
    { to: '/repuesto-maquina', text: 'Repuestos por Máquina' },
    { to: '/subunidad', text: 'Subunidades' },
    { to: '/tipo-mantenimiento', text: 'Tipos de Mantenimiento' },
    { to: '/informe', text: 'Informes Diarios' },
    { to: '/compras', text: 'Compras de Inventario' },
  ];

  const reportesContItems = [
    { to: '/reportes/kardex', text: 'Kardex Valorado de Repuestos' },
    { to: '/reportes/costos', text: 'Costos de Mantenimiento' },
    {
      to: '/reportes/costos-ordenes-trabajo',
      text: 'Costos por Órdenes de Trabajo',
    },
    { to: '/reportes/compras-materiales', text: 'Compras de Materiales' },
    { to: '/reportes/consumo-materiales', text: 'Consumo de Materiales' },
    { to: '/reportes/tomas-inventario', text: 'Tomas Físicas de Inventario' },
    { to: '/reportes/mantenimiento-activo', text: 'Mantenimiento por Activo' },
    // Puedes agregar más reportes contables aquí
  ];

  const kpis = [
    { to: '/kpis/disponibilidad', text: 'Disponibilidad' },
    { to: '/kpis/tmef', text: 'TMEF' },
    { to: '/kpis/tmpr', text: 'TMPR' },
    { to: '/kpis/costo-por-activo', text: 'Costo por Activo' },
  ];

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
      className={`relative h-full transition-width duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-52'
      }`}
    >
      {/* Sidebar principal con posición fija y colores de tema */}
      <aside
        className={`fixed h-full p-4 rounded-r-xl shadow-md flex flex-col transition-colors duration-300 ease-in-out ${theme === 'dark' ? 'border-r-1 border-brown shadow-lg' : 'border-r-1 border-gold shadow-lg'}`}
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
        <nav className="space-y-2 flex-1">
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
          <NavItem
            to="/dashboard"
            icon={<FaChartBar />}
            text="Dashboard"
            isCollapsed={isCollapsed}
            colors={colors}
            theme={theme}
          />
          {/* --- Gestión (con submenú) --- */}
          <NavItem
            icon={<FaCog />}
            text="Gestión"
            isCollapsed={isCollapsed}
            isActive={location.pathname.startsWith('/management')}
            nestedItems={managementItems}
            colors={colors}
            theme={theme}
          />

          {/* --- Reportes Contables (con submenú) --- */}
          <NavItem
            icon={<FaChartBar />}
            text="Reportes Contables"
            isCollapsed={isCollapsed}
            isActive={location.pathname.startsWith('/reportes')}
            nestedItems={reportesContItems}
            colors={colors}
            theme={theme}
          />
          {/* --- KPIs (con submenú) --- */}
          <NavItem
            icon={<FaChartLine />}
            text="KPIs"
            isCollapsed={isCollapsed}
            isActive={location.pathname.startsWith('/kpis')}
            nestedItems={kpis}
            colors={colors}
            theme={theme}
          />
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
