import React from 'react';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { useInforme } from '../hooks/useInforme';
import { InformeTable } from '../components/InformeTable';
import { InformeModal } from '../components/InformeModal';

export const InformePage: React.FC = () => {
  const { theme } = useTheme();
  const {
    state,
    handleOpenModal,
    handleCloseModal,
    handleInputChange,
    handleCreateInforme,
  } = useInforme();

  const pageStyle = {
    backgroundColor: theme === 'dark' ? '#1A1A1A' : '#E6E6E6',
    color: theme === 'dark' ? '#FFFFFF' : '#000000',
    minHeight: '100vh',
    padding: '20px 0',
  };

  return (
    <div style={pageStyle}>
      <InformeTable
        informes={state.informes}
        theme={theme}
        onAddInforme={() => handleOpenModal('create')}
        onViewInforme={(inf) => handleOpenModal('view', inf)}
        loading={state.loading}
        error={state.error}
      />
      <InformeModal
        isOpen={state.isModalOpen}
        mode={state.modalMode}
        selectedInforme={state.selectedInforme}
        formData={state.formData}
        theme={theme}
        loading={state.loading}
        onClose={handleCloseModal}
        onInputChange={handleInputChange}
        onCreateInforme={handleCreateInforme}
      />
    </div>
  );
};
