import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { salidaService } from '../services/salida.service';
import { FaTimes, FaEye, FaTrash, FaPlus } from 'react-icons/fa';

const colors = {
  brown: '#9E5533',
  beige: '#E1CD9B',
  gold: '#FBAF11',
  darkBg: '#1A1A1A',
  lightBg: '#E6E6E6',
  darkText: '#000000',
  lightText: '#FFFFFF',
};

interface Salida {
  id: number;
  nroSalida: string;
  usuarioId: number;
  otId: number;
  fecha: string;
  observacion: string;
  almacen: string;
  subtotal: number;
  descuentoTotal: number;
  total: number;
  estado: 'pendiente' | 'completada' | 'cancelada';
  createdAt: string;
  detalles?: any[];
}

export const ListSalidaPage: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [salidas, setSalidas] = useState<Salida[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSalida, setSelectedSalida] = useState<Salida | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteCountdown, setDeleteCountdown] = useState(3);
  const [canConfirmDelete, setCanConfirmDelete] = useState(false);

  // Cargar salidas
  useEffect(() => {
    fetchSalidas();
  }, []);

  const fetchSalidas = async () => {
    try {
      setLoading(true);
      const data = await salidaService.getSalidas();
      // Convertir valores numéricos que vienen como strings
      const salidasConNumeros = data.map((salida: any) => ({
        ...salida,
        subtotal: Number(salida.subtotal),
        descuentoTotal: Number(salida.descuentoTotal),
        total: Number(salida.total),
        detalles: (salida.detalles || []).map((detalle: any) => ({
          ...detalle,
          cantidad: Number(detalle.cantidad),
          precioUnitario: Number(detalle.precioUnitario),
          importe: Number(detalle.importe),
          porcentajeDescuento: Number(detalle.porcentajeDescuento),
          descuentoMonto: Number(detalle.descuentoMonto),
          subtotal: Number(detalle.subtotal),
        })),
      }));
      setSalidas(salidasConNumeros);
      setError(null);
    } catch (err) {
      console.error('❌ Error al cargar salidas:', err);
      setError('Error al cargar las salidas');
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal para ver
  const handleViewSalida = (salida: Salida) => {
    setSelectedSalida(salida);
    setModalOpen(true);
    setShowDeleteConfirm(false);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setShowDeleteConfirm(false);
    setCanConfirmDelete(false);
    setDeleteCountdown(3);
    setSelectedSalida(null);
  };

  // Eliminar salida (con confirmación)
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
    if (selectedSalida) {
      try {
        await salidaService.deleteSalida(selectedSalida.id);
        console.log('✅ Salida eliminada');
        setSalidas(salidas.filter((s) => s.id !== selectedSalida.id));
        handleCloseModal();
      } catch (err) {
        console.error('❌ Error al eliminar:', err);
        setError('Error al eliminar la salida');
      }
    }
  };

  const textColor = theme === 'dark' ? colors.lightText : colors.darkText;
  const secondaryTextColor = theme === 'dark' ? colors.beige : colors.brown;
  const bgColor = theme === 'dark' ? colors.darkBg : colors.lightBg;
  const theadBgColor = theme === 'dark' ? colors.brown : colors.gold;
  const theadTextColor = theme === 'dark' ? colors.lightText : colors.darkText;
  const tbodyBgColor = theme === 'dark' ? '#232323' : '#FAFAFA';
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

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case 'completada':
        return '#4ADE80';
      case 'cancelada':
        return '#E53E3E';
      default:
        return colors.gold;
    }
  };

  if (error && !loading) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }

  return (
    <div style={pageStyle}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <h2>Salidas de Inventario</h2>
        <button
          onClick={() => navigate('/salidas/registrar')}
          style={{
            background: colors.gold,
            color: colors.darkText,
            border: 'none',
            borderRadius: 4,
            padding: '8px 16px',
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#E69D00';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = colors.gold;
          }}
        >
          <FaPlus /> Registrar Salida
        </button>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-screen-xl mx-auto pb-24">
        <div
          style={{ backgroundColor: bgColor }}
          className="shadow-md rounded-lg overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm md:text-base">
              <thead
                style={{
                  backgroundColor: theadBgColor,
                  color: theadTextColor,
                }}
              >
                <tr>
                  <th className="p-3 text-left font-semibold">Nro Salida</th>
                  <th className="p-3 text-left font-semibold">Usuario ID</th>
                  <th className="p-3 text-left font-semibold">OT ID</th>
                  <th className="p-3 text-left font-semibold">Fecha</th>
                  <th className="p-3 text-right font-semibold">Total</th>
                  <th className="p-3 text-left font-semibold">Estado</th>
                  <th className="p-3 text-center font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody
                style={{
                  backgroundColor: tbodyBgColor,
                  color: textColor,
                  borderColor: borderColor,
                }}
                className="divide-y"
              >
                {salidas.map((salida) => (
                  <tr
                    key={salida.id}
                    className="cursor-pointer transition duration-150 ease-in-out"
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = hoverBgColor;
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = tbodyBgColor;
                    }}
                  >
                    <td className="p-3">{salida.nroSalida}</td>
                    <td className="p-3">{salida.usuarioId}</td>
                    <td className="p-3">{salida.otId}</td>
                    <td className="p-3">
                      {new Date(salida.fecha).toLocaleDateString()}
                    </td>
                    <td
                      className="p-3 text-right font-semibold"
                      style={{ color: colors.gold }}
                    >
                      ${salida.total.toFixed(2)}
                    </td>
                    <td className="p-3">
                      <span
                        style={{
                          backgroundColor: getEstadoBadgeColor(salida.estado),
                          color: '#fff',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                          display: 'inline-block',
                        }}
                      >
                        {salida.estado}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleViewSalida(salida)}
                        style={{ color: colors.gold }}
                        className="hover:opacity-80 transition"
                        title="Ver detalles"
                      >
                        <FaEye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {salidas.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan={7}
                      style={{ color: secondaryTextColor }}
                      className="p-4 text-center"
                    >
                      No se encontraron salidas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {loading && (
            <div
              className="p-4 text-center"
              style={{ color: secondaryTextColor }}
            >
              Cargando...
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          style={{ backgroundColor: overlayBgColor }}
          className="fixed inset-0 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
        >
          <div
            style={{
              backgroundColor: bgColor,
              color: textColor,
            }}
            className="rounded-lg max-w-2xl w-full p-6 shadow-xl relative flex flex-col max-h-[90vh]"
          >
            {!showDeleteConfirm && (
              <button
                style={{ color: secondaryTextColor }}
                className="absolute top-3 right-4 hover:opacity-80 transition"
                onClick={handleCloseModal}
                aria-label="Cerrar modal"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            )}

            <h2
              style={{ color: textColor }}
              className="text-xl font-semibold mb-4"
            >
              Detalles de la Salida
            </h2>

            <div className="flex-grow overflow-y-auto pr-2">
              {!showDeleteConfirm && selectedSalida && (
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p
                        style={{ color: secondaryTextColor }}
                        className="font-semibold mb-1"
                      >
                        Nro Salida:
                      </p>
                      <p>{selectedSalida.nroSalida}</p>
                    </div>
                    <div>
                      <p
                        style={{ color: secondaryTextColor }}
                        className="font-semibold mb-1"
                      >
                        Usuario ID:
                      </p>
                      <p>{selectedSalida.usuarioId}</p>
                    </div>
                    <div>
                      <p
                        style={{ color: secondaryTextColor }}
                        className="font-semibold mb-1"
                      >
                        OT ID:
                      </p>
                      <p>{selectedSalida.otId}</p>
                    </div>
                    <div>
                      <p
                        style={{ color: secondaryTextColor }}
                        className="font-semibold mb-1"
                      >
                        Fecha:
                      </p>
                      <p>
                        {new Date(selectedSalida.fecha).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p
                        style={{ color: secondaryTextColor }}
                        className="font-semibold mb-1"
                      >
                        Almacén:
                      </p>
                      <p>{selectedSalida.almacen || '-'}</p>
                    </div>
                    <div>
                      <p
                        style={{ color: secondaryTextColor }}
                        className="font-semibold mb-1"
                      >
                        Estado:
                      </p>
                      <span
                        style={{
                          backgroundColor: getEstadoBadgeColor(
                            selectedSalida.estado,
                          ),
                          color: '#fff',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                          display: 'inline-block',
                        }}
                      >
                        {selectedSalida.estado}
                      </span>
                    </div>
                  </div>

                  {selectedSalida.observacion && (
                    <div
                      style={{
                        borderColor,
                        borderTop: `1px solid ${borderColor}`,
                      }}
                      className="pt-4 mt-4"
                    >
                      <p
                        style={{ color: secondaryTextColor }}
                        className="font-semibold mb-1"
                      >
                        Observación:
                      </p>
                      <p>{selectedSalida.observacion}</p>
                    </div>
                  )}

                  <div
                    style={{
                      borderColor,
                      borderTop: `1px solid ${borderColor}`,
                    }}
                    className="pt-4 mt-4"
                  >
                    <p
                      style={{ color: secondaryTextColor }}
                      className="font-semibold mb-3"
                    >
                      Productos Saliendo:
                    </p>
                    {selectedSalida.detalles &&
                    selectedSalida.detalles.length > 0 ? (
                      <div className="space-y-2">
                        {selectedSalida.detalles.map((detalle, idx) => (
                          <div
                            key={idx}
                            style={{
                              backgroundColor: inputBgColor,
                              borderColor: inputBorderColor,
                            }}
                            className="p-3 border rounded text-xs"
                          >
                            <p>
                              <strong>{detalle.nombre}</strong> (
                              {detalle.codigo})
                            </p>
                            <p>
                              Cantidad: {detalle.cantidad}{' '}
                              {detalle.unidadMedida} | Precio: $
                              {detalle.precioUnitario.toFixed(2)} | Importe: $
                              {detalle.importe.toFixed(2)}
                            </p>
                            {detalle.porcentajeDescuento > 0 && (
                              <p style={{ color: colors.gold }}>
                                Descuento: {detalle.porcentajeDescuento}% ($
                                {detalle.descuentoMonto.toFixed(2)})
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: secondaryTextColor }}>Sin productos</p>
                    )}
                  </div>

                  <div
                    style={{
                      borderColor,
                      borderTop: `1px solid ${borderColor}`,
                    }}
                    className="pt-4 mt-4"
                  >
                    <div className="flex justify-between mb-2">
                      <span style={{ color: secondaryTextColor }}>
                        Subtotal:
                      </span>
                      <span>${selectedSalida.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span style={{ color: secondaryTextColor }}>
                        Descuento Total:
                      </span>
                      <span style={{ color: colors.gold }}>
                        -${selectedSalida.descuentoTotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-base font-bold">
                      <span style={{ color: secondaryTextColor }}>Total:</span>
                      <span style={{ color: colors.gold }}>
                        ${selectedSalida.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {showDeleteConfirm && selectedSalida && (
                <div style={{ color: textColor }} className="text-center">
                  <p className="text-lg font-semibold mb-3">¿Estás seguro?</p>
                  <p className="mb-4">
                    Estás a punto de eliminar la salida{' '}
                    <strong className="font-medium">
                      #{selectedSalida.nroSalida}
                    </strong>
                    .
                  </p>
                  <p className="text-sm mb-4">
                    Esta acción eliminará de manera permanente la salida y sus
                    detalles.
                  </p>
                  {deleteCountdown > 0 && (
                    <p
                      style={{ color: colors.gold }}
                      className="text-2xl font-bold my-4"
                    >
                      {deleteCountdown}
                    </p>
                  )}
                  {canConfirmDelete && (
                    <p
                      style={{
                        color: theme === 'dark' ? '#4ADE80' : '#166534',
                      }}
                      className="text-sm my-4"
                    >
                      Puedes confirmar la eliminación.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div
              style={{ borderColor }}
              className={`mt-6 pt-4 border-t flex ${showDeleteConfirm ? 'justify-between' : 'justify-end'} gap-3`}
            >
              {!showDeleteConfirm && (
                <>
                  <button
                    onClick={handleDeleteClick}
                    style={{ color: deleteColor }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.color = deleteHoverColor;
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.color = deleteColor;
                    }}
                    className="flex items-center gap-1.5 text-sm transition duration-150 ease-in-out"
                  >
                    <FaTrash /> Eliminar
                  </button>
                  <button
                    onClick={handleCloseModal}
                    style={{
                      color: textColor,
                      backgroundColor: 'transparent',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor =
                        theme === 'dark' ? '#2A2A2A' : '#D6D6D6';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    className="px-4 py-2 rounded text-sm transition"
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
                      color: textColor,
                      backgroundColor: 'transparent',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor =
                        theme === 'dark' ? '#2A2A2A' : '#D6D6D6';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    className="px-4 py-2 rounded text-sm transition"
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
                      color: colors.lightText,
                      cursor: canConfirmDelete ? 'pointer' : 'not-allowed',
                    }}
                    onMouseOver={(e) => {
                      if (canConfirmDelete) {
                        e.currentTarget.style.backgroundColor =
                          deleteHoverColor;
                      }
                    }}
                    onMouseOut={(e) => {
                      if (canConfirmDelete) {
                        e.currentTarget.style.backgroundColor = deleteColor;
                      }
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded text-sm transition"
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
