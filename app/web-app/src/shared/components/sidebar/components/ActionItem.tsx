import React from 'react';

interface ActionItemProps {
  icon: React.ReactNode;
  text: string;
  onClick: () => void;
  isCollapsed: boolean;
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

export const ActionItem = ({
  icon,
  text,
  onClick,
  isCollapsed,
  colors,
  theme,
}: ActionItemProps) => {
  // Definir colores basados en el tema
  const textColor = theme === 'dark' ? colors.lightText : colors.darkText;
  const iconColor = theme === 'dark' ? colors.gold : colors.brown;

  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full h-[42px] rounded-lg transition-colors duration-150 ease-in-out ${theme === 'dark' ? `hover:${colors.brown}30` : `hover:${colors.gold}20`}`}
      style={{
        backgroundColor:
          theme === 'dark' ? `${colors.brown}10` : `${colors.gold}10`,
      }}
    >
      <div
        className="w-[42px] flex items-center justify-center"
        style={{ color: iconColor }}
      >
        <div className="w-[18px] h-[18px]">{icon}</div>
      </div>
      {!isCollapsed && (
        <span className="ml-2" style={{ color: textColor }}>
          {text}
        </span>
      )}
    </button>
  );
};
