import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { informeService } from '../services/informe.service';
import {
  FaEye,
  FaTrash,
  FaSync,
  FaPlus,
  FaEdit,
  FaChevronDown,
} from 'react-icons/fa';
import { API_URL } from '../../../shared/config/api';

const colors = {
  brown: '#9E5533',
  beige: '#E1CD9B',
  gold: '#FBAF11',
  darkBg: '#1A1A1A',
  lightBg: '#E6E6E6',
  darkText: '#000000',
  lightText: '#FFFFFF',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

interface ComboOption {
  value: string;
  label: string;
}

function toDatetimeLocal(val: string | null | undefined): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ── SearchableSelect ──────────────────────────────────────────────────────────

interface SearchableSelectProps {
  options: ComboOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  inputBg: string;
  inputBorder: string;
  textColor: string;
}

function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Buscar...',
  disabled = false,
  inputBg,
  inputBorder,
  textColor,
}: SearchableSelectProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? '';

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options.filter(
    (o) =>
      o.label.toLowerCase().includes(query.toLowerCase()) ||
      o.value.includes(query),
  );

  const handleSelect = (opt: ComboOption) => {
    onChange(opt.value);
    setOpen(false);
    setQuery('');
  };

  const displayValue = open ? query : selectedLabel;

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={displayValue}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (!e.target.value) onChange('');
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            width: '100%',
            padding: '10px 36px 10px 10px',
            backgroundColor: inputBg,
            color: textColor,
            border: `1px solid ${inputBorder}`,
            borderRadius: '4px',
            boxSizing: 'border-box',
          }}
        />
        <FaChevronDown
          style={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: `translateY(-50%) rotate(${open ? '180deg' : '0deg'})`,
            color: textColor,
            opacity: 0.5,
            pointerEvents: 'none',
            transition: 'transform 0.2s',
          }}
        />
      </div>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: inputBg,
            border: `1px solid ${inputBorder}`,
            borderRadius: '4px',
            maxHeight: '220px',
            overflowY: 'auto',
            zIndex: 2000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          {filtered.length === 0 ? (
            <div
              style={{
                padding: '10px',
                color: textColor,
                opacity: 0.5,
                fontSize: '13px',
              }}
            >
              Sin resultados
            </div>
          ) : (
            filtered.map((opt) => (
              <div
                key={opt.value}
                onMouseDown={() => handleSelect(opt)}
                style={{
                  padding: '9px 12px',
                  cursor: 'pointer',
                  color: textColor,
                  backgroundColor:
                    opt.value === value ? colors.gold + '33' : 'transparent',
                  fontSize: '13px',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.backgroundColor =
                    colors.gold + '44';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.backgroundColor =
                    opt.value === value ? colors.gold + '33' : 'transparent';
                }}
              >
                {opt.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

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
  const [filtroTecnico, setFiltroTecnico] = useState('');

  // Edit state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingInforme, setEditingInforme] = useState<Informe | null>(null);
  const [editUserId, setEditUserId] = useState('');
  const [editDetalles, setEditDetalles] = useState<
    Array<{
      otId: string;
      observaciones: string;
      horaInicio: string;
      horaFinalización: string;
    }>
  >([]);
  const [userOptions, setUserOptions] = useState<ComboOption[]>([]);
  const [tecnicoNombres, setTecnicoNombres] = useState<Record<number, string>>(
    {},
  );
  const [otOptions, setOtOptions] = useState<ComboOption[]>([]);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Cargar informes al montar
  useEffect(() => {
    fetchInformes();
  }, []);

  // Cargar usuarios y OTs
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [resUsers, resOTs] = await Promise.all([
          fetch(`${API_URL}/users`),
          fetch(`${API_URL}/ots`),
        ]);
        const [users, ots] = (await Promise.all([
          resUsers.ok ? resUsers.json() : Promise.resolve([]),
          resOTs.ok ? resOTs.json() : Promise.resolve([]),
        ])) as [
          Array<{ id: number; name: string; lastName: string }>,
          Array<{ id: number; descripcionTarea: string }>,
        ];
        const usersArr = Array.isArray(users) ? users : [];
        setUserOptions(
          usersArr.map((u) => ({
            value: String(u.id),
            label: `${u.id} - ${u.name} ${u.lastName}`.trim(),
          })),
        );
        setTecnicoNombres(
          Object.fromEntries(
            usersArr.map((u) => [u.id, `${u.name} ${u.lastName}`.trim()]),
          ),
        );
        setOtOptions(
          (Array.isArray(ots) ? ots : []).map((o) => ({
            value: String(o.id),
            label: `${o.id} - ${o.descripcionTarea ?? ''}`,
          })),
        );
      } catch (err) {
        console.error('Error al cargar opciones:', err);
      }
    };
    loadOptions();
  }, []);

  const informesFiltrados = filtroTecnico
    ? informes.filter((inf) => String(inf.userId) === filtroTecnico)
    : informes;

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

  const handleEditInforme = (informe: Informe) => {
    setEditingInforme(informe);
    setEditUserId(String(informe.userId));
    setEditDetalles(
      (informe.detalles ?? []).map((d) => ({
        otId: String(d.otId),
        observaciones: d.observaciones ?? '',
        horaInicio: toDatetimeLocal(d.horaInicio),
        horaFinalización: toDatetimeLocal(d['horaFinalización']),
      })),
    );
    setEditError('');
    setShowEditModal(true);
  };

  const handleChangeEditDetalle = (
    index: number,
    field: 'otId' | 'observaciones' | 'horaInicio' | 'horaFinalización',
    value: string,
  ) => {
    const next = [...editDetalles];
    next[index] = { ...next[index], [field]: value };
    setEditDetalles(next);
  };

  const addEditDetalle = () => {
    setEditDetalles([
      ...editDetalles,
      { otId: '', observaciones: '', horaInicio: '', horaFinalización: '' },
    ]);
  };

  const removeEditDetalle = (index: number) => {
    setEditDetalles(editDetalles.filter((_, i) => i !== index));
  };

  const handleSaveEdit = async () => {
    if (!editingInforme || !editUserId) {
      setEditError('El usuario es requerido');
      return;
    }
    const valid = editDetalles.every(
      (d) => d.otId && d.horaInicio && d['horaFinalización'],
    );
    if (!valid) {
      setEditError(
        'Completa OT, hora inicio y hora finalización en todos los detalles',
      );
      return;
    }
    try {
      setEditLoading(true);
      setEditError('');
      await informeService.updateInforme(editingInforme.id, {
        userId: Number(editUserId),
        detalles: editDetalles.map((d) => ({
          otId: Number(d.otId),
          observaciones: d.observaciones || null,
          horaInicio: d.horaInicio,
          horaFinalización: d['horaFinalización'],
        })),
      });
      setShowEditModal(false);
      await fetchInformes();
    } catch (err: unknown) {
      setEditError((err as Error).message || 'Error al actualizar informe');
    } finally {
      setEditLoading(false);
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

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '20px',
            maxWidth: '360px',
          }}
        >
          <span
            style={{
              color: secondaryTextColor,
              fontWeight: 'bold',
              fontSize: '13px',
              whiteSpace: 'nowrap',
            }}
          >
            Técnico:
          </span>
          <SearchableSelect
            options={userOptions}
            value={filtroTecnico}
            onChange={setFiltroTecnico}
            placeholder="Todos los técnicos"
            inputBg={inputBgColor}
            inputBorder={inputBorderColor}
            textColor={textColor}
          />
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
        ) : informesFiltrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            {informes.length === 0
              ? 'No hay informes registrados'
              : 'Ningún informe coincide con el técnico seleccionado'}
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
                    Técnico
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
                {informesFiltrados.map((informe: Informe, index: number) => (
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
                      {tecnicoNombres[informe.userId] ??
                        `Técnico #${informe.userId}`}
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
                      <button
                        onClick={() => handleEditInforme(informe)}
                        disabled={loading}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          backgroundColor: colors.brown,
                          color: '#FFF',
                          border: 'none',
                          padding: '6px 10px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        <FaEdit /> Editar
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
                <strong>Técnico:</strong>{' '}
                {tecnicoNombres[selectedInforme.userId] ??
                  `Técnico #${selectedInforme.userId}`}
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
                          <strong>Inicio:</strong>{' '}
                          {detalle.horaInicio
                            ? new Date(detalle.horaInicio).toLocaleString(
                                'es-BO',
                              )
                            : '—'}
                        </p>
                        <p style={{ margin: '5px 0' }}>
                          <strong>Finalización:</strong>{' '}
                          {detalle.horaFinalización
                            ? new Date(detalle.horaFinalización).toLocaleString(
                                'es-BO',
                              )
                            : '—'}
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

        {/* Modal de edición */}
        {showEditModal && editingInforme && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              zIndex: 1000,
              overflowY: 'auto',
              padding: '40px 20px',
            }}
            onClick={() => setShowEditModal(false)}
          >
            <div
              style={{
                backgroundColor: inputBgColor,
                color: textColor,
                padding: '24px',
                borderRadius: '8px',
                width: '100%',
                maxWidth: '680px',
                border: `1px solid ${inputBorderColor}`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ marginTop: 0, color: secondaryTextColor }}>
                Editar Informe #{editingInforme.id}
              </h2>

              {editError && (
                <div
                  style={{
                    backgroundColor: errorColor,
                    color: '#FFF',
                    padding: '10px',
                    borderRadius: '4px',
                    marginBottom: '16px',
                  }}
                >
                  {editError}
                </div>
              )}

              {/* Usuario */}
              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '5px',
                    fontWeight: 'bold',
                    color: secondaryTextColor,
                  }}
                >
                  Usuario *
                </label>
                <SearchableSelect
                  options={userOptions}
                  value={editUserId}
                  onChange={setEditUserId}
                  placeholder="Buscar por ID o nombre..."
                  disabled={editLoading}
                  inputBg={bgColor}
                  inputBorder={inputBorderColor}
                  textColor={textColor}
                />
              </div>

              {/* Detalles */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                }}
              >
                <h3 style={{ margin: 0 }}>Detalles</h3>
                <button
                  onClick={addEditDetalle}
                  disabled={editLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: colors.gold,
                    color: colors.darkText,
                    border: 'none',
                    padding: '7px 12px',
                    borderRadius: '4px',
                    cursor: editLoading ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                  }}
                >
                  <FaPlus /> Agregar Detalle
                </button>
              </div>

              {editDetalles.map((det, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: bgColor,
                    padding: '14px',
                    borderRadius: '4px',
                    marginBottom: '12px',
                    border: `1px solid ${inputBorderColor}`,
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '12px',
                      marginBottom: '12px',
                    }}
                  >
                    {/* OT */}
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '5px',
                          fontWeight: 'bold',
                          color: secondaryTextColor,
                          fontSize: '13px',
                        }}
                      >
                        Orden de Trabajo *
                      </label>
                      <SearchableSelect
                        options={otOptions}
                        value={det.otId}
                        onChange={(v) =>
                          handleChangeEditDetalle(idx, 'otId', v)
                        }
                        placeholder="Buscar OT..."
                        disabled={editLoading}
                        inputBg={inputBgColor}
                        inputBorder={inputBorderColor}
                        textColor={textColor}
                      />
                    </div>

                    {/* Hora Inicio */}
                    <div>
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '5px',
                          fontWeight: 'bold',
                          color: secondaryTextColor,
                          fontSize: '13px',
                        }}
                      >
                        Fecha y Hora Inicio *
                      </label>
                      <input
                        type="datetime-local"
                        value={det.horaInicio}
                        onChange={(e) =>
                          handleChangeEditDetalle(
                            idx,
                            'horaInicio',
                            e.target.value,
                          )
                        }
                        disabled={editLoading}
                        style={{
                          width: '100%',
                          padding: '10px',
                          backgroundColor: inputBgColor,
                          color: textColor,
                          border: `1px solid ${inputBorderColor}`,
                          borderRadius: '4px',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    {/* Hora Finalización */}
                    <div>
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '5px',
                          fontWeight: 'bold',
                          color: secondaryTextColor,
                          fontSize: '13px',
                        }}
                      >
                        Fecha y Hora Finalización *
                      </label>
                      <input
                        type="datetime-local"
                        value={det['horaFinalización']}
                        onChange={(e) =>
                          handleChangeEditDetalle(
                            idx,
                            'horaFinalización',
                            e.target.value,
                          )
                        }
                        disabled={editLoading}
                        style={{
                          width: '100%',
                          padding: '10px',
                          backgroundColor: inputBgColor,
                          color: textColor,
                          border: `1px solid ${inputBorderColor}`,
                          borderRadius: '4px',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    {/* Observaciones */}
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '5px',
                          fontWeight: 'bold',
                          color: secondaryTextColor,
                          fontSize: '13px',
                        }}
                      >
                        Observaciones
                      </label>
                      <textarea
                        value={det.observaciones}
                        onChange={(e) =>
                          handleChangeEditDetalle(
                            idx,
                            'observaciones',
                            e.target.value,
                          )
                        }
                        disabled={editLoading}
                        style={{
                          width: '100%',
                          padding: '10px',
                          backgroundColor: inputBgColor,
                          color: textColor,
                          border: `1px solid ${inputBorderColor}`,
                          borderRadius: '4px',
                          boxSizing: 'border-box',
                          minHeight: '70px',
                          fontFamily: 'inherit',
                        }}
                      />
                    </div>
                  </div>

                  {editDetalles.length > 1 && (
                    <button
                      onClick={() => removeEditDetalle(idx)}
                      disabled={editLoading}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: errorColor,
                        color: '#FFF',
                        border: 'none',
                        padding: '7px 12px',
                        borderRadius: '4px',
                        cursor: editLoading ? 'not-allowed' : 'pointer',
                        fontSize: '13px',
                      }}
                    >
                      <FaTrash /> Remover
                    </button>
                  )}
                </div>
              ))}

              {/* Footer */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  onClick={() => setShowEditModal(false)}
                  disabled={editLoading}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: inputBorderColor,
                    color: textColor,
                    border: 'none',
                    borderRadius: '4px',
                    cursor: editLoading ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={editLoading}
                  style={{
                    flex: 2,
                    padding: '10px',
                    backgroundColor: colors.brown,
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: editLoading ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  {editLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
