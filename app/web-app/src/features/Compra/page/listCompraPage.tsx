import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import {
  FaTimes,
  FaEye,
  FaTrash,
  FaPlus,
  FaEdit,
  FaSearch,
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

interface CompraDetalle {
  nombre: string;
  codigo: string;
  unidadMedida: string;
  cantidad: number;
  precioUnitario: number;
  importe: number;
  porcentajeDescuento: number;
  descuentoMonto: number;
  subtotal: number;
}

interface Compra {
  id: number;
  nroDocumento: string;
  tipoDocumento: string;
  nroFactura: string;
  nit: string;
  proveedorId: number;
  almacen: string;
  fecha: string;
  subtotal: number;
  descuentoTotal: number;
  total: number;
  createdAt: string;
  detalles?: CompraDetalle[];
}

export const ListCompraPage: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCompra, setSelectedCompra] = useState<Compra | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteCountdown, setDeleteCountdown] = useState(3);
  const [canConfirmDelete, setCanConfirmDelete] = useState(false);
  const [searchQ, setSearchQ] = useState('');

  // Cargar compras
  useEffect(() => {
    fetchCompras();
  }, []);

  const fetchCompras = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/compras');
      if (!response.ok) throw new Error('Error al cargar compras');
      const data = await response.json();
      // Convertir valores numéricos que vienen como strings
      const comprasConNumeros = data.map((compra: Compra) => ({
        ...compra,
        subtotal: Number(compra.subtotal),
        descuentoTotal: Number(compra.descuentoTotal),
        total: Number(compra.total),
        detalles: (compra.detalles || []).map((detalle: CompraDetalle) => ({
          ...detalle,
          cantidad: Number(detalle.cantidad),
          precioUnitario: Number(detalle.precioUnitario),
          importe: Number(detalle.importe),
          porcentajeDescuento: Number(detalle.porcentajeDescuento),
          descuentoMonto: Number(detalle.descuentoMonto),
          subtotal: Number(detalle.subtotal),
        })),
      }));
      setCompras(comprasConNumeros);
      setError(null);
    } catch (err) {
      console.error('❌ Error al cargar compras:', err);
      setError('Error al cargar las compras');
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal para ver
  const handleViewCompra = (compra: Compra) => {
    setSelectedCompra(compra);
    setModalOpen(true);
    setShowDeleteConfirm(false);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setShowDeleteConfirm(false);
    setCanConfirmDelete(false);
    setDeleteCountdown(3);
    setSelectedCompra(null);
  };

  // Eliminar compra (con confirmación)
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
    if (selectedCompra) {
      try {
        const response = await fetch(
          `http://localhost:3000/compras/${selectedCompra.id}`,
          {
            method: 'DELETE',
          },
        );
        if (!response.ok) throw new Error('Error al eliminar');
        console.log('✅ Compra eliminada');
        setCompras(compras.filter((c) => c.id !== selectedCompra.id));
        handleCloseModal();
      } catch (err) {
        console.error('❌ Error al eliminar:', err);
        setError('Error al eliminar la compra');
      }
    }
  };

  const textColor = theme === 'dark' ? colors.lightText : colors.darkText;
  const secondaryTextColor = theme === 'dark' ? colors.beige : colors.brown;
  const bgColor = theme === 'dark' ? colors.darkBg : colors.lightBg;
  const theadBgColor = theme === 'dark' ? colors.brown : colors.gold;
  const theadTextColor = theme === 'dark' ? colors.lightText : colors.darkText;
  void (theme === 'dark' ? '#232323' : '#FAFAFA');
  const hoverBgColor = theme === 'dark' ? '#2A2A2A' : '#F5F5F5';
  const inputBgColor = theme === 'dark' ? '#2A2A2A' : '#F5F5F5';
  const inputBorderColor = theme === 'dark' ? '#3A3A3A' : '#D6D6D6';
  const borderColor = theme === 'dark' ? '#3A3A3A' : '#D6D6D6';
  const overlayBgColor = 'rgba(0, 0, 0, 0.75)';
  const deleteColor = '#E53E3E';
  const deleteHoverColor = '#B91C1C';

  const pageStyle = {
    color: textColor,
    minHeight: '100vh',
    padding: '20px 0',
  };

  const filteredCompras = compras.filter((c) => {
    if (!searchQ.trim()) return true;
    const q = searchQ.toLowerCase();
    return (
      String(c.id).includes(q) ||
      (c.nroDocumento ?? '').toLowerCase().includes(q) ||
      (c.nroFactura ?? '').toLowerCase().includes(q) ||
      (c.nit ?? '').toLowerCase().includes(q) ||
      (c.tipoDocumento ?? '').toLowerCase().includes(q) ||
      new Date(c.fecha).toLocaleDateString('es-ES').includes(q) ||
      (c.detalles?.some(
        (d) =>
          (d.nombre ?? '').toLowerCase().includes(q) ||
          (d.codigo ?? '').toLowerCase().includes(q),
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
    <div style={{ ...pageStyle, padding: '1.5rem' }}>
      {/* Page Header */}
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
              Compras
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
              : `${compras.length} registro${compras.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={() => navigate('/compras/crear')}
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
          <FaPlus /> Nueva Compra
        </button>
      </div>

      {/* Search Bar */}
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
          placeholder="Buscar por Nro. Doc., NIT, factura, repuesto, fecha..."
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

      {/* Results info */}
      {searchQ && (
        <p
          style={{
            fontSize: '0.8rem',
            color: secondaryTextColor,
            marginBottom: '0.75rem',
          }}
        >
          {filteredCompras.length} resultado
          {filteredCompras.length !== 1 ? 's' : ''} para &ldquo;
          <strong>{searchQ}</strong>&rdquo;
        </p>
      )}

      {/* Table Card */}
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
                <th
                  style={{
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Nro. Documento
                </th>
                <th
                  style={{
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Tipo
                </th>
                <th
                  style={{
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  NIT Proveedor
                </th>
                <th
                  style={{
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Fecha
                </th>
                <th
                  style={{
                    padding: '0.75rem 1rem',
                    textAlign: 'right',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Total Bs.
                </th>
                <th
                  style={{
                    padding: '0.75rem 1rem',
                    textAlign: 'center',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody style={{ color: textColor }}>
              {filteredCompras.map((compra) => (
                <tr
                  key={compra.id}
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
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ fontWeight: 600 }}>
                      {compra.nroDocumento}
                    </span>
                    {compra.nroFactura && (
                      <span
                        style={{
                          display: 'block',
                          fontSize: '0.75rem',
                          color: secondaryTextColor,
                        }}
                      >
                        Fact. {compra.nroFactura}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '0.15rem 0.5rem',
                        borderRadius: 4,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background:
                          compra.tipoDocumento === 'Factura'
                            ? theme === 'dark'
                              ? '#1e3a5f'
                              : '#e3f2fd'
                            : theme === 'dark'
                              ? '#2a2a1e'
                              : '#f5f5e3',
                        color:
                          compra.tipoDocumento === 'Factura'
                            ? '#2196F3'
                            : secondaryTextColor,
                      }}
                    >
                      {compra.tipoDocumento}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: '0.75rem 1rem',
                      fontFamily: 'monospace',
                      fontSize: '0.82rem',
                    }}
                  >
                    {compra.nit}
                  </td>
                  <td
                    style={{
                      padding: '0.75rem 1rem',
                      whiteSpace: 'nowrap',
                      color: secondaryTextColor,
                    }}
                  >
                    {new Date(compra.fecha).toLocaleDateString('es-ES')}
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
                    {compra.total.toFixed(2)} Bs.
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                    <button
                      onClick={() => handleViewCompra(compra)}
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
                      title="Ver detalles"
                    >
                      <FaEye /> Ver
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCompras.length === 0 && !loading && (
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
                      : 'No hay compras registradas.'}
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

      {/* Modal */}
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

            {/* Modal title */}
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
                Detalles de la Compra
              </h2>
            </div>

            <div style={{ flexGrow: 1, overflowY: 'auto', paddingRight: 4 }}>
              {!showDeleteConfirm && selectedCompra && (
                <div>
                  {/* Info grid */}
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
                      {
                        label: 'Nro. Documento',
                        value: selectedCompra.nroDocumento,
                      },
                      {
                        label: 'Tipo Documento',
                        value: selectedCompra.tipoDocumento,
                      },
                      {
                        label: 'Nro. Factura',
                        value: selectedCompra.nroFactura,
                      },
                      { label: 'NIT', value: selectedCompra.nit },
                      {
                        label: 'Fecha',
                        value: new Date(
                          selectedCompra.fecha,
                        ).toLocaleDateString('es-ES'),
                      },
                      {
                        label: 'Almacén',
                        value: selectedCompra.almacen || '—',
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

                  {/* Productos */}
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
                      Productos Comprados (
                      {selectedCompra.detalles?.length ?? 0})
                    </p>
                    {selectedCompra.detalles &&
                    selectedCompra.detalles.length > 0 ? (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem',
                        }}
                      >
                        {selectedCompra.detalles.map((detalle, idx) => (
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
                                  {detalle.codigo} — {detalle.unidadMedida}
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
                                  {detalle.cantidad} &times;{' '}
                                  {detalle.precioUnitario.toFixed(2)}
                                </p>
                              </div>
                            </div>
                            {detalle.porcentajeDescuento > 0 && (
                              <p
                                style={{
                                  fontSize: '0.75rem',
                                  color: colors.gold,
                                  margin: '4px 0 0',
                                }}
                              >
                                Descuento: {detalle.porcentajeDescuento}% (−
                                {detalle.descuentoMonto.toFixed(2)} Bs.)
                              </p>
                            )}
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
                        Sin productos.
                      </p>
                    )}
                  </div>

                  {/* Totals */}
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
                      <span>{selectedCompra.subtotal.toFixed(2)} Bs.</span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.875rem',
                      }}
                    >
                      <span style={{ color: secondaryTextColor }}>
                        Descuento
                      </span>
                      <span style={{ color: colors.gold }}>
                        −{selectedCompra.descuentoTotal.toFixed(2)} Bs.
                      </span>
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
                        {selectedCompra.total.toFixed(2)} Bs.
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {showDeleteConfirm && selectedCompra && (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <p
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      marginBottom: '0.75rem',
                    }}
                  >
                    ¿Estás seguro?
                  </p>
                  <p style={{ marginBottom: '0.75rem', lineHeight: 1.6 }}>
                    Estás a punto de eliminar la compra{' '}
                    <strong>#{selectedCompra.nroDocumento}</strong>. Esta acción
                    es permanente.
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
                      Puedes confirmar la eliminación.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Modal footer */}
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
                      navigate(`/compras/crear?id=${selectedCompra!.id}`);
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
                      ? 'Confirmar Eliminación'
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
