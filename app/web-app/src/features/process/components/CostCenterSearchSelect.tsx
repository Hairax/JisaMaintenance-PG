import React, { useState } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

export interface CostCenterOption {
  id: number;
  name: string;
}

interface SearchableSelectProps {
  options: CostCenterOption[];
  value: number | string;
  onChange: (id: number) => void;
  placeholder?: string;
  disabled?: boolean;
  inputBg: string;
  inputBorder: string;
  textColor: string;
  secondaryTextColor: string;
}

const colors = {
  brown: '#9E5533',
  beige: '#E1CD9B',
  gold: '#FBAF11',
  darkBg: '#1A1A1A',
  lightBg: '#E6E6E6',
  darkText: '#000000',
  lightText: '#FFFFFF',
};

export const CostCenterSearchSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Haz clic para seleccionar',
  disabled = false,
  inputBg,
  inputBorder,
  textColor,
  secondaryTextColor,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedOption = options.find((opt) => opt.id === Number(value));
  const selectedLabel = selectedOption
    ? `${selectedOption.id} - ${selectedOption.name}`
    : placeholder;

  const filteredOptions = options.filter((opt) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      String(opt.id).includes(searchLower) ||
      opt.name.toLowerCase().includes(searchLower)
    );
  });

  const handleSelectOption = (optionId: number) => {
    onChange(optionId);
    setSearchQuery('');
    setIsModalOpen(false);
  };

  const isDarkMode = inputBg === '#2A2A2A';
  const modalBgColor = isDarkMode ? colors.darkBg : colors.lightBg;
  const modalBorderColor = isDarkMode ? '#3A3A3A' : '#D6D6D6';
  const hoverBgColor = isDarkMode ? '#2A2A2A' : '#F0F0F0';
  const overlayBgColor = 'rgba(0, 0, 0, 0.75)';

  return (
    <>
      {/* Display Input - No interactive, just shows selection */}
      <div
        onClick={() => !disabled && setIsModalOpen(true)}
        style={{
          width: '100%',
          padding: '10px 12px',
          backgroundColor: inputBg,
          color: textColor,
          border: `1px solid ${inputBorder}`,
          borderRadius: '4px',
          boxSizing: 'border-box',
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          userSelect: 'none',
          transition: 'all 0.2s ease',
        }}
        onMouseOver={(e) => {
          if (!disabled) {
            e.currentTarget.style.borderColor = colors.gold;
          }
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = inputBorder;
        }}
      >
        <span style={{ flex: 1 }}>{selectedLabel}</span>
        <FaSearch
          style={{ marginLeft: '8px', fontSize: '14px', opacity: 0.6 }}
        />
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: overlayBgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '20px',
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: modalBgColor,
              borderRadius: '8px',
              width: '100%',
              maxWidth: '500px',
              maxHeight: '600px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
              border: `1px solid ${modalBorderColor}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px',
                borderBottom: `1px solid ${modalBorderColor}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h3
                style={{
                  margin: 0,
                  color: textColor,
                  fontSize: '18px',
                  fontWeight: 'bold',
                }}
              >
                Selecciona un Centro de Costo
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: textColor,
                  cursor: 'pointer',
                  fontSize: '20px',
                  padding: '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FaTimes />
              </button>
            </div>

            {/* Search Input */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: `1px solid ${modalBorderColor}`,
              }}
            >
              <div style={{ position: 'relative' }}>
                <FaSearch
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: secondaryTextColor,
                    fontSize: '14px',
                  }}
                />
                <input
                  type="text"
                  placeholder="Busca por ID o nombre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 40px',
                    backgroundColor: inputBg,
                    color: textColor,
                    border: `1px solid ${inputBorder}`,
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                  className="focus:outline-none focus:ring-1"
                />
              </div>
            </div>

            {/* Options List */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '8px',
              }}
            >
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => handleSelectOption(option.id)}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      marginBottom: '4px',
                      borderRadius: '4px',
                      backgroundColor:
                        value === option.id
                          ? 'rgba(251, 175, 17, 0.15)'
                          : 'transparent',
                      border:
                        value === option.id
                          ? `2px solid ${colors.gold}`
                          : 'none',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                    onMouseOver={(e) => {
                      if (value !== option.id) {
                        e.currentTarget.style.backgroundColor = hoverBgColor;
                      }
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor =
                        value === option.id
                          ? 'rgba(251, 175, 17, 0.15)'
                          : 'transparent';
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 'bold',
                        color: textColor,
                        fontSize: '14px',
                      }}
                    >
                      {option.name}
                    </div>
                    <div
                      style={{ fontSize: '12px', color: secondaryTextColor }}
                    >
                      ID: {option.id}
                    </div>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    padding: '40px 20px',
                    textAlign: 'center',
                    color: secondaryTextColor,
                  }}
                >
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                    No se encontraron centros de costo
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', opacity: 0.7 }}>
                    Intenta con otro término de búsqueda
                  </p>
                </div>
              )}
            </div>

            {/* Footer Info */}
            <div
              style={{
                padding: '12px 20px',
                borderTop: `1px solid ${modalBorderColor}`,
                fontSize: '12px',
                color: secondaryTextColor,
                textAlign: 'right',
              }}
            >
              {options.length > 0 && (
                <>
                  Mostrando {filteredOptions.length} de {options.length}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
