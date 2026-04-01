import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { informeService } from '../services/informe.service';
import { FaEye, FaTrash, FaSync, FaPlus } from 'react-icons/fa';

const colors = {
  brown: '#9E5533',
  beige: '#E1CD9B',
  gold: '#FBAF11',
  darkBg: '#1A1A1A',
  lightBg: '#E6E6E6',
  darkText: '#000000',
  lightText: '#FFFFFF',
};

export default function ListInformePage() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Colores dinámicos según tema
  const textColor = theme === 'dark' ? colors.lightText : colors.darkText;
  const secondaryTextColor = theme === 'dark' ? colors.beige : colors.brown;
  const bgColor = theme === 'dark' ? colors.darkBg : colors.lightBg;
  const inputBgColor = theme === 'dark' ? '#2A2A2A' : '#F5F5F5';
  const inputBorderColor = theme === 'dark' ? '#3A3A3A' : '#D6D6D6';
  const theadBgColor = theme === 'dark' ? colors.brown : colors.gold;
  const theadTextColor = theme === 'dark' ? colors.lightText : colors.darkText;
  const tbodyBgColor = theme === 'dark' ? '#232323' : '#FAFAFA';
  const errorColor = '#E53E3E';

  interface Informe {
    id: number;
    userId: number;
    createdAt: string;
    detalles?: Array<{
      id: number;
      otId: number;
      horaInicio: string;
      horaFinalización: string;
      observaciones?: string;
    }>;
  }

  const [informes, setInformes] = useState<Informe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedInforme, setSelectedInforme] = useState<Informe | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Cargar informes al montar
  useEffect(() => {
    fetchInformes();
  }, []);

  const fetchInformes = async () => {
    setLoading(true);
    try {
      const data = await informeService.getInformes();
      setInformes(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError('Error al cargar informes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewInforme = (informe: Informe) => {
    setSelectedInforme(informe);
    setShowDetailModal(true);
  };

  const handleDeleteInforme = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este informe?')) {
      return;
    }

    try {
      setLoading(true);
      await informeService.deleteInforme(id);
      setInformes(informes.filter((inf) => inf.id !== id));
      alert('Informe eliminado exitosamente');
    } catch (err: unknown) {
      setError('Error al eliminar informe');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: bgColor,
        color: textColor,
        minHeight: '100vh',
        padding: '20px',
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <h1 style={{ color: secondaryTextColor, margin: 0 }}>Informes</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => navigate('/informes/registrar')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: colors.brown,
                color: colors.lightText,
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
              onMouseEnter={(e) => {
                const target = e.currentTarget as HTMLButtonElement;
                target.style.backgroundColor = '#7a4427';
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget as HTMLButtonElement;
                target.style.backgroundColor = colors.brown;
              }}
            >
              <FaPlus /> Nuevo Informe
            </button>
            <button
              onClick={fetchInformes}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: colors.gold,
                color: colors.darkText,
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              <FaSync /> Actualizar
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: errorColor,
              color: '#FFF',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '20px',
            }}
          >
            {error}
          </div>
        )}

        {loading && informes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            Cargando informes...
          </div>
        ) : informes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            No hay informes registrados
          </div>
        ) : (
          <div
            style={{
              overflowX: 'auto',
              backgroundColor: inputBgColor,
              borderRadius: '8px',
              border: `1px solid ${inputBorderColor}`,
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: theadBgColor,
                    color: theadTextColor,
                  }}
                >
                  <th
                    style={{
                      padding: '12px',
                      borderBottom: `1px solid ${inputBorderColor}`,
                    }}
                  >
                    ID
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      borderBottom: `1px solid ${inputBorderColor}`,
                    }}
                  >
                    Usuario ID
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      borderBottom: `1px solid ${inputBorderColor}`,
                    }}
                  >
                    Cantidad de Detalles
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      borderBottom: `1px solid ${inputBorderColor}`,
                    }}
                  >
                    Creado
                  </th>
                  <th
                    style={{
                      padding: '12px',
                      borderBottom: `1px solid ${inputBorderColor}`,
                      textAlign: 'center',
                    }}
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {informes.map((informe: Informe, index: number) => (
                  <tr
                    key={informe.id}
                    style={{
                      backgroundColor:
                        index % 2 === 0 ? tbodyBgColor : 'transparent',
                    }}
                  >
                    <td
                      style={{
                        padding: '12px',
                        borderBottom: `1px solid ${inputBorderColor}`,
                      }}
                    >
                      {informe.id}
                    </td>
                    <td
                      style={{
                        padding: '12px',
                        borderBottom: `1px solid ${inputBorderColor}`,
                      }}
                    >
                      {informe.userId}
                    </td>
                    <td
                      style={{
                        padding: '12px',
                        borderBottom: `1px solid ${inputBorderColor}`,
                      }}
                    >
                      {informe.detalles?.length || 0}
                    </td>
                    <td
                      style={{
                        padding: '12px',
                        borderBottom: `1px solid ${inputBorderColor}`,
                      }}
                    >
                      {new Date(informe.createdAt).toLocaleDateString()}
                    </td>
                    <td
                      style={{
                        padding: '12px',
                        borderBottom: `1px solid ${inputBorderColor}`,
                        textAlign: 'center',
                      }}
                    >
                      <button
                        onClick={() => handleViewInforme(informe)}
                        disabled={loading}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          backgroundColor: '#2196F3',
                          color: '#FFF',
                          border: 'none',
                          padding: '6px 10px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          marginRight: '5px',
                          fontSize: '12px',
                        }}
                      >
                        <FaEye /> Ver
                      </button>
                      <button
                        onClick={() => handleDeleteInforme(informe.id)}
                        disabled={loading}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          backgroundColor: errorColor,
                          color: '#FFF',
                          border: 'none',
                          padding: '6px 10px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        <FaTrash /> Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal de detalles */}
        {showDetailModal && selectedInforme && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
            }}
            onClick={() => setShowDetailModal(false)}
          >
            <div
              style={{
                backgroundColor: inputBgColor,
                color: textColor,
                padding: '20px',
                borderRadius: '8px',
                maxWidth: '600px',
                maxHeight: '80vh',
                overflowY: 'auto',
                border: `1px solid ${inputBorderColor}`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ marginTop: 0 }}>Informe #{selectedInforme.id}</h2>

              <div style={{ marginBottom: '15px' }}>
                <strong>Usuario ID:</strong> {selectedInforme.userId}
              </div>

              <div style={{ marginBottom: '15px' }}>
                <strong>Fecha de Creación:</strong>{' '}
                {new Date(selectedInforme.createdAt).toLocaleString()}
              </div>

              <h3 style={{ marginTop: '20px' }}>Detalles del Informe</h3>

              {selectedInforme.detalles &&
              selectedInforme.detalles.length > 0 ? (
                <div>
                  {selectedInforme.detalles.map(
                    (
                      detalle: (typeof selectedInforme.detalles)[0],
                      index: number,
                    ) => (
                      <div
                        key={index}
                        style={{
                          backgroundColor: bgColor,
                          padding: '10px',
                          borderRadius: '4px',
                          marginBottom: '10px',
                          border: `1px solid ${inputBorderColor}`,
                        }}
                      >
                        <p style={{ margin: '5px 0' }}>
                          <strong>OT ID:</strong> {detalle.otId}
                        </p>
                        <p style={{ margin: '5px 0' }}>
                          <strong>Hora Inicio:</strong> {detalle.horaInicio}
                        </p>
                        <p style={{ margin: '5px 0' }}>
                          <strong>Hora Finalización:</strong>{' '}
                          {detalle.horaFinalización}
                        </p>
                        {detalle.observaciones && (
                          <p style={{ margin: '5px 0' }}>
                            <strong>Observaciones:</strong>{' '}
                            {detalle.observaciones}
                          </p>
                        )}
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <p>No hay detalles en este informe</p>
              )}

              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: colors.gold,
                  color: colors.darkText,
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: '20px',
                  fontWeight: 'bold',
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
