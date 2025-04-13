import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';

interface NavItemProps {
  to?: string; // Hacer 'to' opcional para items que solo abren submenus
  onClick?: () => void;
  icon: React.ReactNode;
  text: string;
  isCollapsed: boolean;
  isActive?: boolean;
  nestedItems?: { to: string; text: string }[];
  colors: {
    brown: string;
    beige: string;
    gold: string;
    darkBg: string;
    lightBg: string;
    darkText: string;
    lightText: string;
    darkHover: string;
    lightHover: string;
  };
  theme: string;
}

export const NavItem = ({
  to,
  onClick,
  icon,
  text,
  isCollapsed,
  isActive: isActiveProp,
  nestedItems,
  colors,
  theme,
}: NavItemProps) => {
  const location = useLocation();
  const [showNested, setShowNested] = useState(false);

  // Calcular isActive si no se proporciona y 'to' existe
  const isActive =
    isActiveProp ?? (to ? location.pathname.startsWith(to) : false);

  // Definir colores basados en el tema
  const textColor = theme === 'dark' ? colors.lightText : colors.darkText;
  const iconColor = theme === 'dark' ? colors.gold : colors.brown;

  // Colores para estados hover y active
  const hoverBg = theme === 'dark' ? `${colors.brown}30` : `${colors.gold}20`;
  const activeBg = theme === 'dark' ? `${colors.brown}40` : `${colors.gold}30`;

  // Colores para menú desplegable
  const nestedPopupBg = theme === 'dark' ? colors.darkBg : colors.lightBg;
  const nestedPopupBorder =
    theme === 'dark' ? `${colors.brown}60` : `${colors.gold}60`;
  const nestedItemHoverBg =
    theme === 'dark' ? `${colors.brown}30` : `${colors.gold}30`;

  const handleItemClick = () => {
    if (nestedItems) {
      setShowNested(!showNested);
    }
    if (onClick) {
      onClick();
    }
  };

  // Contenido del Item
  const ItemContent = (
    <>
      <div
        className="w-[42px] flex items-center justify-center"
        style={{ color: iconColor }}
      >
        <div className="w-[18px] h-[18px]">{icon}</div>
      </div>
      {!isCollapsed && (
        <>
          <span className="ml-2" style={{ color: textColor }}>
            {text}
          </span>
          {nestedItems && (
            <FaChevronRight
              className={`ml-auto mr-2 transition-transform duration-200 ${
                showNested ? 'rotate-90' : ''
              }`}
              style={{ color: iconColor }}
            />
          )}
        </>
      )}
    </>
  );

  // Clases base del contenedor del item
  const itemContainerClasses = `flex items-center ${
    isCollapsed ? 'justify-center' : 'justify-start'
  } h-[42px] rounded-lg transition-all duration-200 cursor-pointer`;

  // Estilos de background para hover y active
  const containerStyle = {
    backgroundColor: isActive ? activeBg : 'transparent',
    ':hover': {
      backgroundColor: isActive ? activeBg : hoverBg,
    },
  };

  return (
    <div className="relative w-full">
      {to && !nestedItems ? (
        <NavLink
          to={to}
          className={`flex items-center w-full h-[42px] rounded-lg transition-colors duration-150 ease-in-out ${
            theme === 'dark' ? 'hover:bg-brown-900/30' : 'hover:bg-gold-500/20'
          }`}
          style={{
            backgroundColor: isActive
              ? theme === 'dark'
                ? `${colors.brown}30`
                : `${colors.gold}20`
              : 'transparent',
          }}
          onClick={handleItemClick}
        >
          {ItemContent}
        </NavLink>
      ) : (
        <div
          className={itemContainerClasses}
          style={containerStyle}
          onClick={handleItemClick}
        >
          {ItemContent}
        </div>
      )}

      {/* Menú Anidado */}
      {nestedItems && (
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            showNested
              ? isCollapsed
                ? 'opacity-100 visible'
                : 'max-h-96'
              : isCollapsed
                ? 'opacity-0 invisible'
                : 'max-h-0'
          } ${
            isCollapsed
              ? 'absolute left-full top-0 ml-2 z-20 min-w-[200px] rounded-md shadow-lg border'
              : 'relative w-full pl-6 mt-1'
          }`}
          style={{
            backgroundColor: nestedPopupBg,
            borderColor: nestedPopupBorder,
            transition: isCollapsed
              ? 'opacity 0.2s ease-in-out, visibility 0.2s ease-in-out'
              : undefined,
          }}
        >
          <div className={`${isCollapsed ? 'p-2 space-y-1' : 'space-y-1'}`}>
            {nestedItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="flex items-center w-full h-[36px] rounded-md px-3 transition-colors duration-150 ease-in-out text-sm"
                style={(props) => ({
                  color: textColor,
                  backgroundColor: props.isActive
                    ? theme === 'dark'
                      ? `${colors.brown}50`
                      : `${colors.gold}50`
                    : 'transparent',
                  ':hover': {
                    backgroundColor: nestedItemHoverBg,
                  },
                })}
                onClick={() => setShowNested(false)}
              >
                {item.text}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
