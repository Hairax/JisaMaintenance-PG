import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { salidaService } from '../services/salida.service';
import {
  FaEdit,
  FaEye,
  FaPlus,
  FaSearch,
  FaTimes,
  FaTrash,
} from 'react-icons/fa';

const colors = {
  brown: '#9E5533',
  beige: '#E1CD9B',
  gold: '#FBAF11',
  darkBg: '#1A1A1A',
  lightBg: '#E6E6E6',
  darkText: '#000000',
  lightText: '#FFFFFF',
};

interface SalidaDetalle {
  repuestoId?: number;
  productoId?: number;
  nombre: string;
  codigo: string;
  unidadMedida: string;
  cantidad: number;
  precioUnitario: number;
  importe: number;
  subtotal: number;
}

interface Usuario {
  id: number;
  nombre?: string;
  nombreCompleto?: string;
  fullName?: string;
  name?: string;
  username?: string;
  email?: string;
}

interface OT {
  id: number;
  descripcion?: string;
  description?: string;
  numeroOt?: string;
  codigo?: string;
  nombre?: string;
}

interface Salida {
  id: number;
  nroSalida?: string;
  usuarioId: number;
  otId: number;
  fecha: string;
  observacion?: string;
  almacen?: string;
  subtotal: number;
  total: number;
  createdAt: string;
  detalles?: SalidaDetalle[];
}

export const ListSalidaPage: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [salidas, setSalidas] = useState<Salida[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [ots, setOts] = useState<OT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQ, setSearchQ] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSalida, setSelectedSalida] = useState<Salida | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteCountdown, setDeleteCountdown] = useState(3);
  const [canConfirmDelete, setCanConfirmDelete] = useState(false);

  useEffect(() => {
    fetchSalidas();
  }, []);

  const fetchSalidas = async () => {
    try {
      setLoading(true);
      const [data, usersData, otsData] = await Promise.all([
        salidaService.getSalidas(),
        salidaService.getUsers(),
        salidaService.getOts(),
      ]);

      setUsuarios(Array.isArray(usersData) ? (usersData as Usuario[]) : []);
      setOts(Array.isArray(otsData) ? (otsData as OT[]) : []);

      const salidasConNumeros = (Array.isArray(data) ? data : []).map(
        (salida: Salida & { detalles?: SalidaDetalle[] }) => ({
          ...salida,
          subtotal: Number(salida.subtotal),
          total: Number(salida.total),
          detalles: (salida.detalles || []).map((detalle: SalidaDetalle) => ({
            ...detalle,
            cantidad: Number(detalle.cantidad),
            precioUnitario: Number(detalle.precioUnitario),
            importe: Number(detalle.importe),
            subtotal: Number(detalle.subtotal),
          })),
        }),
      );
      setSalidas(salidasConNumeros);
      setError(null);
    } catch (err) {
      console.error('Error al cargar salidas:', err);
      setError('Error al cargar las salidas');
    } finally {
      setLoading(false);
    }
  };

  const getUsuarioNombreCompleto = (u?: Usuario) =>
    u?.nombreCompleto ??
    u?.fullName ??
    u?.nombre ??
    u?.name ??
    u?.username ??
    u?.email ??
    '';

  const getOtDescripcion = (o?: OT) =>
    o?.descripcion ??
    o?.description ??
    o?.nombre ??
    o?.codigo ??
    o?.numeroOt ??
    '';

  const getUsuarioById = (id: number) => usuarios.find((u) => u.id === id);
  const getOtById = (id: number) => ots.find((o) => o.id === id);

  const handleViewSalida = (salida: Salida) => {
    setSelectedSalida(salida);
    setModalOpen(true);
    setShowDeleteConfirm(false);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setShowDeleteConfirm(false);
    setCanConfirmDelete(false);
    setDeleteCountdown(3);
    setSelectedSalida(null);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
    setDeleteCountdown(3);
    setCanConfirmDelete(false);
    let countdown = 3;
    const interval = setInterval(() => {
      countdown -= 1;
      setDeleteCountdown(countdown);
      if (countdown <= 0) {
        setCanConfirmDelete(true);
        clearInterval(interval);
      }
    }, 1000);
  };

  const handleDelete = async () => {
    if (!selectedSalida) return;
    try {
      await salidaService.deleteSalida(selectedSalida.id);
      setSalidas(salidas.filter((s) => s.id !== selectedSalida.id));
      handleCloseModal();
    } catch (err) {
      console.error('Error al eliminar:', err);
      setError('Error al eliminar la salida');
    }
  };

  const textColor = theme === 'dark' ? colors.lightText : colors.darkText;
  const secondaryTextColor = theme === 'dark' ? colors.beige : colors.brown;
  const bgColor = theme === 'dark' ? colors.darkBg : colors.lightBg;
  const theadBgColor = theme === 'dark' ? colors.brown : colors.gold;
  const theadTextColor = theme === 'dark' ? colors.lightText : colors.darkText;
  const hoverBgColor = theme === 'dark' ? '#2A2A2A' : '#F5F5F5';
  const inputBgColor = theme === 'dark' ? '#2A2A2A' : '#F5F5F5';
  const inputBorderColor = theme === 'dark' ? '#3A3A3A' : '#D6D6D6';
  const borderColor = theme === 'dark' ? '#3A3A3A' : '#D6D6D6';
  const overlayBgColor = 'rgba(0, 0, 0, 0.75)';
  const deleteColor = '#E53E3E';
  const deleteHoverColor = '#B91C1C';

  const filteredSalidas = salidas.filter((s) => {
    if (!searchQ.trim()) return true;
    const q = searchQ.toLowerCase();
    const usuario = getUsuarioById(s.usuarioId);
    const ot = getOtById(s.otId);
    const usuarioNombre = getUsuarioNombreCompleto(usuario).toLowerCase();
    const otDescripcion = getOtDescripcion(ot).toLowerCase();

    return (
      String(s.id).includes(q) ||
      String(s.nroSalida || '')
        .toLowerCase()
        .includes(q) ||
      String(s.usuarioId).includes(q) ||
      usuarioNombre.includes(q) ||
      String(s.otId).includes(q) ||
      otDescripcion.includes(q) ||
      new Date(s.fecha).toLocaleDateString('es-ES').includes(q) ||
      (s.detalles?.some(
        (d) =>
          String(d.repuestoId ?? d.productoId ?? '').includes(q) ||
          String(d.codigo || '')
            .toLowerCase()
            .includes(q) ||
          String(d.nombre || '')
            .toLowerCase()
            .includes(q),
      ) ??
        false)
    );
  });

  if (error && !loading) {
    return (
      <div style={{ textAlign: 'center', color: '#E53E3E', marginTop: '2rem' }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ color: textColor, minHeight: '100vh', padding: '1.5rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: 4,
            }}
          >
            <div
              style={{
                width: 4,
                height: 28,
                background: colors.gold,
                borderRadius: 2,
              }}
            />
            <h2
              style={{
                fontSize: '1.4rem',
                fontWeight: 700,
                margin: 0,
                color: textColor,
              }}
            >
              Salidas de Repuestos
            </h2>
          </div>
          <p
            style={{
              fontSize: '0.82rem',
              color: secondaryTextColor,
              margin: 0,
              paddingLeft: 16,
            }}
          >
            {loading
              ? 'Cargando...'
              : `${salidas.length} registro${salidas.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={() => navigate('/salidas/registrar')}
          style={{
            background: colors.gold,
            color: colors.darkText,
            border: 'none',
            borderRadius: 6,
            padding: '0.55rem 1.1rem',
            cursor: 'pointer',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
            whiteSpace: 'nowrap',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#E69D00';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = colors.gold;
          }}
        >
          <FaPlus /> Nueva Salida
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
        <FaSearch
          style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: secondaryTextColor,
            fontSize: '0.85rem',
            pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          placeholder="Buscar por id salida, usuario (id/nombre), OT (id/descripcion), repuesto..."
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
          style={{
            width: '100%',
            padding: '0.6rem 2.5rem 0.6rem 2.4rem',
            border: `1px solid ${inputBorderColor}`,
            borderRadius: 8,
            backgroundColor: inputBgColor,
            color: textColor,
            fontSize: '0.9rem',
            boxSizing: 'border-box',
          }}
        />
        {searchQ && (
          <button
            onClick={() => setSearchQ('')}
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: secondaryTextColor,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <FaTimes />
          </button>
        )}
      </div>

      <div
        style={{
          background: bgColor,
          borderRadius: 10,
          border: `1px solid ${borderColor}`,
          overflow: 'hidden',
          boxShadow:
            theme === 'dark'
              ? '0 2px 12px rgba(0,0,0,0.4)'
              : '0 2px 12px rgba(0,0,0,0.08)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.875rem',
            }}
          >
            <thead>
              <tr
                style={{ backgroundColor: theadBgColor, color: theadTextColor }}
              >
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>
                  Nro. Salida
                </th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>
                  Usuario
                </th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>
                  OT
                </th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>
                  Fecha
                </th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                  Total Bs.
                </th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody style={{ color: textColor }}>
              {filteredSalidas.map((salida) => (
                <tr
                  key={salida.id}
                  style={{
                    borderBottom: `1px solid ${borderColor}`,
                    transition: 'background 0.15s',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = hoverBgColor;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>
                    #{salida.id}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ fontWeight: 600 }}>
                      {getUsuarioNombreCompleto(
                        getUsuarioById(salida.usuarioId),
                      ) || `Usuario ${salida.usuarioId}`}
                    </span>
                    <span
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        color: secondaryTextColor,
                      }}
                    >
                      ID: {salida.usuarioId}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ fontWeight: 600 }}>
                      {getOtDescripcion(getOtById(salida.otId)) ||
                        `OT ${salida.otId}`}
                    </span>
                    <span
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        color: secondaryTextColor,
                      }}
                    >
                      ID: {salida.otId}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: '0.75rem 1rem',
                      whiteSpace: 'nowrap',
                      color: secondaryTextColor,
                    }}
                  >
                    {new Date(salida.fecha).toLocaleDateString('es-ES')}
                  </td>
                  <td
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'right',
                      fontWeight: 700,
                      color: colors.gold,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {salida.total.toFixed(2)} Bs.
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                    <button
                      onClick={() => handleViewSalida(salida)}
                      style={{
                        background: 'none',
                        border: `1px solid ${colors.gold}`,
                        borderRadius: 6,
                        color: colors.gold,
                        padding: '0.3rem 0.65rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = colors.gold;
                        e.currentTarget.style.color = colors.darkText;
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'none';
                        e.currentTarget.style.color = colors.gold;
                      }}
                    >
                      <FaEye /> Ver
                    </button>
                  </td>
                </tr>
              ))}

              {filteredSalidas.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: '2.5rem 1rem',
                      textAlign: 'center',
                      color: secondaryTextColor,
                    }}
                  >
                    {searchQ
                      ? `No se encontraron resultados para "${searchQ}".`
                      : 'No hay salidas registradas.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {loading && (
          <div
            style={{
              padding: '2rem',
              textAlign: 'center',
              color: secondaryTextColor,
            }}
          >
            Cargando...
          </div>
        )}
      </div>

      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: overlayBgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: bgColor,
              color: textColor,
              borderRadius: 12,
              width: '100%',
              maxWidth: 680,
              padding: '1.5rem',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh',
              border: `1px solid ${borderColor}`,
            }}
          >
            {!showDeleteConfirm && (
              <button
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 14,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: secondaryTextColor,
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                }}
                onClick={handleCloseModal}
                aria-label="Cerrar modal"
              >
                <FaTimes />
              </button>
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                marginBottom: '1.25rem',
              }}
            >
              <div
                style={{
                  width: 4,
                  height: 22,
                  background: colors.gold,
                  borderRadius: 2,
                }}
              />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                Detalles de la Salida
              </h2>
            </div>

            <div style={{ flexGrow: 1, overflowY: 'auto', paddingRight: 4 }}>
              {!showDeleteConfirm && selectedSalida && (
                <div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fit, minmax(160px, 1fr))',
                      gap: '0.75rem',
                      marginBottom: '1.25rem',
                    }}
                  >
                    {[
                      { label: 'Nro. Salida', value: `#${selectedSalida.id}` },
                      {
                        label: 'Usuario',
                        value:
                          getUsuarioNombreCompleto(
                            getUsuarioById(selectedSalida.usuarioId),
                          ) || `Usuario ${selectedSalida.usuarioId}`,
                      },
                      {
                        label: 'OT',
                        value:
                          getOtDescripcion(getOtById(selectedSalida.otId)) ||
                          `OT ${selectedSalida.otId}`,
                      },
                      {
                        label: 'ID Usuario/OT',
                        value: `${selectedSalida.usuarioId} / ${selectedSalida.otId}`,
                      },
                      {
                        label: 'Fecha',
                        value: new Date(
                          selectedSalida.fecha,
                        ).toLocaleDateString('es-ES'),
                      },
                      {
                        label: 'Almacen',
                        value: selectedSalida.almacen || '-',
                      },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        style={{
                          background: inputBgColor,
                          borderRadius: 8,
                          padding: '0.6rem 0.75rem',
                          border: `1px solid ${inputBorderColor}`,
                        }}
                      >
                        <p
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: secondaryTextColor,
                            margin: '0 0 4px',
                          }}
                        >
                          {label}
                        </p>
                        <p
                          style={{
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            margin: 0,
                          }}
                        >
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {selectedSalida.observacion && (
                    <div
                      style={{
                        borderTop: `1px solid ${borderColor}`,
                        paddingTop: '0.75rem',
                        marginBottom: '1rem',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: secondaryTextColor,
                          margin: '0 0 6px',
                        }}
                      >
                        Observacion
                      </p>
                      <p style={{ margin: 0 }}>{selectedSalida.observacion}</p>
                    </div>
                  )}

                  <div
                    style={{
                      borderTop: `1px solid ${borderColor}`,
                      paddingTop: '1rem',
                    }}
                  >
                    <p
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: secondaryTextColor,
                        margin: '0 0 0.75rem',
                      }}
                    >
                      Repuestos de Salida (
                      {selectedSalida.detalles?.length ?? 0})
                    </p>
                    {selectedSalida.detalles &&
                    selectedSalida.detalles.length > 0 ? (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem',
                        }}
                      >
                        {selectedSalida.detalles.map((detalle, idx) => (
                          <div
                            key={idx}
                            style={{
                              backgroundColor: inputBgColor,
                              border: `1px solid ${inputBorderColor}`,
                              borderRadius: 8,
                              padding: '0.6rem 0.75rem',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                gap: '0.5rem',
                                flexWrap: 'wrap',
                              }}
                            >
                              <div>
                                <p
                                  style={{
                                    fontWeight: 700,
                                    fontSize: '0.875rem',
                                    margin: '0 0 2px',
                                  }}
                                >
                                  {detalle.nombre}
                                </p>
                                <p
                                  style={{
                                    fontSize: '0.75rem',
                                    color: secondaryTextColor,
                                    margin: 0,
                                    fontFamily: 'monospace',
                                  }}
                                >
                                  {detalle.codigo} - {detalle.unidadMedida}
                                </p>
                              </div>
                              <div
                                style={{ textAlign: 'right', flexShrink: 0 }}
                              >
                                <p
                                  style={{
                                    fontWeight: 700,
                                    color: colors.gold,
                                    fontSize: '0.9rem',
                                    margin: '0 0 2px',
                                  }}
                                >
                                  {detalle.subtotal.toFixed(2)} Bs.
                                </p>
                                <p
                                  style={{
                                    fontSize: '0.75rem',
                                    color: secondaryTextColor,
                                    margin: 0,
                                  }}
                                >
                                  {detalle.cantidad} x{' '}
                                  {detalle.precioUnitario.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p
                        style={{
                          color: secondaryTextColor,
                          fontSize: '0.875rem',
                        }}
                      >
                        Sin repuestos.
                      </p>
                    )}
                  </div>

                  <div
                    style={{
                      borderTop: `1px solid ${borderColor}`,
                      marginTop: '1rem',
                      paddingTop: '0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.875rem',
                      }}
                    >
                      <span style={{ color: secondaryTextColor }}>
                        Subtotal
                      </span>
                      <span>{selectedSalida.subtotal.toFixed(2)} Bs.</span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontWeight: 700,
                        fontSize: '1rem',
                        paddingTop: '0.4rem',
                        borderTop: `1px solid ${borderColor}`,
                        marginTop: '0.2rem',
                      }}
                    >
                      <span>Total</span>
                      <span style={{ color: colors.gold }}>
                        {selectedSalida.total.toFixed(2)} Bs.
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {showDeleteConfirm && selectedSalida && (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <p
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      marginBottom: '0.75rem',
                    }}
                  >
                    Estas seguro?
                  </p>
                  <p style={{ marginBottom: '0.75rem', lineHeight: 1.6 }}>
                    Estas a punto de eliminar la salida{' '}
                    <strong>#{selectedSalida.id}</strong>. Esta accion es
                    permanente.
                  </p>
                  {deleteCountdown > 0 ? (
                    <p
                      style={{
                        color: colors.gold,
                        fontSize: '2.5rem',
                        fontWeight: 800,
                        margin: '1rem 0',
                      }}
                    >
                      {deleteCountdown}
                    </p>
                  ) : (
                    <p
                      style={{
                        color: theme === 'dark' ? '#4ADE80' : '#166534',
                        fontSize: '0.875rem',
                        margin: '1rem 0',
                      }}
                    >
                      Puedes confirmar la eliminacion.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div
              style={{
                marginTop: '1.25rem',
                paddingTop: '1rem',
                borderTop: `1px solid ${borderColor}`,
                display: 'flex',
                justifyContent: showDeleteConfirm
                  ? 'space-between'
                  : 'flex-end',
                gap: '0.75rem',
                flexWrap: 'wrap',
              }}
            >
              {!showDeleteConfirm && (
                <>
                  <button
                    onClick={() => {
                      navigate(`/salidas/registrar?id=${selectedSalida!.id}`);
                      handleCloseModal();
                    }}
                    style={{
                      background: 'none',
                      border: `1px solid ${colors.gold}`,
                      borderRadius: 6,
                      color: colors.gold,
                      padding: '0.4rem 0.9rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = colors.gold;
                      e.currentTarget.style.color = colors.darkText;
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'none';
                      e.currentTarget.style.color = colors.gold;
                    }}
                  >
                    <FaEdit /> Editar
                  </button>

                  <button
                    onClick={handleDeleteClick}
                    style={{
                      background: 'none',
                      border: `1px solid ${deleteColor}`,
                      borderRadius: 6,
                      color: deleteColor,
                      padding: '0.4rem 0.9rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = deleteColor;
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'none';
                      e.currentTarget.style.color = deleteColor;
                    }}
                  >
                    <FaTrash /> Eliminar
                  </button>

                  <button
                    onClick={handleCloseModal}
                    style={{
                      background: 'none',
                      border: `1px solid ${borderColor}`,
                      borderRadius: 6,
                      color: textColor,
                      padding: '0.4rem 0.9rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background =
                        theme === 'dark' ? '#2A2A2A' : '#E6E6E6';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'none';
                    }}
                  >
                    Cerrar
                  </button>
                </>
              )}

              {showDeleteConfirm && (
                <>
                  <button
                    onClick={handleCloseModal}
                    style={{
                      background: 'none',
                      border: `1px solid ${borderColor}`,
                      borderRadius: 6,
                      color: textColor,
                      padding: '0.4rem 0.9rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background =
                        theme === 'dark' ? '#2A2A2A' : '#E6E6E6';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'none';
                    }}
                  >
                    Cancelar
                  </button>

                  <button
                    onClick={handleDelete}
                    disabled={!canConfirmDelete}
                    style={{
                      backgroundColor: canConfirmDelete
                        ? deleteColor
                        : theme === 'dark'
                          ? '#8B3A3A'
                          : '#FFB0B0',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '0.4rem 0.9rem',
                      cursor: canConfirmDelete ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }}
                    onMouseOver={(e) => {
                      if (canConfirmDelete)
                        e.currentTarget.style.backgroundColor =
                          deleteHoverColor;
                    }}
                    onMouseOut={(e) => {
                      if (canConfirmDelete)
                        e.currentTarget.style.backgroundColor = deleteColor;
                    }}
                  >
                    <FaTrash />{' '}
                    {canConfirmDelete
                      ? 'Confirmar Eliminacion'
                      : `Confirmar (${deleteCountdown})`}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
