import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { informeService } from '../services/informe.service';
import { FaPlus, FaTrash, FaSave, FaChevronDown } from 'react-icons/fa';
import { API_URL } from '../../../shared/config/api';

const API = API_URL;

const colors = {
  brown: '#9E5533',
  beige: '#E1CD9B',
  gold: '#FBAF11',
  darkBg: '#1A1A1A',
  lightBg: '#E6E6E6',
  darkText: '#000000',
  lightText: '#FFFFFF',
};

// ── SearchableSelect ──────────────────────────────────────────────────────────

interface ComboOption {
  value: string;
  label: string;
}

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

  // Close on outside click
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
            zIndex: 1000,
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

// ── Page ──────────────────────────────────────────────────────────────────────

interface UserOption {
  id: number;
  name: string;
  lastName: string;
}

interface OTOption {
  id: number;
  descripcionTarea: string;
}

export default function RegisterInformePage() {
  const { theme } = useTheme();

  const textColor = theme === 'dark' ? colors.lightText : colors.darkText;
  const secondaryTextColor = theme === 'dark' ? colors.beige : colors.brown;
  const bgColor = theme === 'dark' ? colors.darkBg : colors.lightBg;
  const inputBgColor = theme === 'dark' ? '#2A2A2A' : '#F5F5F5';
  const inputBorderColor = theme === 'dark' ? '#3A3A3A' : '#D6D6D6';
  const successColor = theme === 'dark' ? '#4ADE80' : '#22863a';
  const errorColor = '#E53E3E';
  const addButtonBg = colors.gold;
  const addButtonHover = '#E69D00';

  const [userId, setUserId] = useState('');
  const [detalles, setDetalles] = useState<
    Array<{
      otId: string;
      observaciones: string;
      horaInicio: string;
      horaFinalización: string;
    }>
  >([{ otId: '', observaciones: '', horaInicio: '', horaFinalización: '' }]);

  const [userOptions, setUserOptions] = useState<ComboOption[]>([]);
  const [otOptions, setOtOptions] = useState<ComboOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [resUsers, resOTs] = await Promise.all([
          fetch(`${API}/users`),
          fetch(`${API}/ots`),
        ]);
        const [users, ots] = (await Promise.all([
          resUsers.ok ? resUsers.json() : Promise.resolve([]),
          resOTs.ok ? resOTs.json() : Promise.resolve([]),
        ])) as [UserOption[], OTOption[]];

        setUserOptions(
          (Array.isArray(users) ? users : []).map((u) => ({
            value: String(u.id),
            label: `${u.id} - ${u.name} ${u.lastName}`.trim(),
          })),
        );
        setOtOptions(
          (Array.isArray(ots) ? ots : []).map((o) => ({
            value: String(o.id),
            label: `${o.id} - ${o.descripcionTarea ?? ''}`,
          })),
        );
      } catch (err) {
        console.error('Error al cargar datos:', err);
      }
    };
    loadData();
  }, []);

  const handleChangeDetalle = (
    index: number,
    field: keyof (typeof detalles)[0],
    value: string,
  ) => {
    const newDetalles = [...detalles];
    newDetalles[index][field] = value;
    setDetalles(newDetalles);
  };

  const addDetalle = () => {
    setDetalles([
      ...detalles,
      { otId: '', observaciones: '', horaInicio: '', horaFinalización: '' },
    ]);
  };

  const removeDetalle = (index: number) => {
    setDetalles(detalles.filter((_, i) => i !== index));
  };

  const handleGuardarInforme = async () => {
    if (!userId || detalles.length === 0) {
      setError('Por favor completa los campos requeridos');
      return;
    }
    const detallesValidos = detalles.every(
      (d) => d.otId && d.horaInicio && d.horaFinalización,
    );
    if (!detallesValidos) {
      setError(
        'Por favor completa todos los campos en los detalles del informe',
      );
      return;
    }

    try {
      setLoading(true);
      setError('');
      const informeData = {
        userId: Number(userId),
        detalles: detalles.map((d) => ({
          otId: Number(d.otId),
          observaciones: d.observaciones || null,
          horaInicio: d.horaInicio,
          horaFinalización: d.horaFinalización,
        })),
      };
      const result = await informeService.createInforme(informeData);
      alert(`Informe registrado exitosamente! ID: ${result.id}`);
      setUserId('');
      setDetalles([
        { otId: '', observaciones: '', horaInicio: '', horaFinalización: '' },
      ]);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Error al guardar informe');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
    color: secondaryTextColor,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px',
    backgroundColor: bgColor,
    color: textColor,
    border: `1px solid ${inputBorderColor}`,
    borderRadius: '4px',
    boxSizing: 'border-box',
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
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '20px', color: secondaryTextColor }}>
          Registrar Informe
        </h1>

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

        {/* Formulario Principal */}
        <div
          style={{
            backgroundColor: inputBgColor,
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: `1px solid ${inputBorderColor}`,
          }}
        >
          <h2 style={{ marginBottom: '15px', fontSize: '18px' }}>
            Información del Informe
          </h2>

          {/* Usuario */}
          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Usuario *</label>
            <SearchableSelect
              options={userOptions}
              value={userId}
              onChange={setUserId}
              placeholder="Buscar por ID o nombre..."
              disabled={loading}
              inputBg={bgColor}
              inputBorder={inputBorderColor}
              textColor={textColor}
            />
          </div>
        </div>

        {/* Detalles del Informe */}
        <div
          style={{
            backgroundColor: inputBgColor,
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: `1px solid ${inputBorderColor}`,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px',
            }}
          >
            <h2 style={{ fontSize: '18px', margin: 0 }}>
              Detalles del Informe
            </h2>
            <button
              onClick={addDetalle}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: addButtonBg,
                color: colors.darkText,
                border: 'none',
                padding: '8px 12px',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
              }}
              onMouseEnter={(e) => {
                if (!loading)
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    addButtonHover;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  addButtonBg;
              }}
            >
              <FaPlus /> Agregar Detalle
            </button>
          </div>

          {detalles.map((detalle, index) => (
            <div
              key={index}
              style={{
                backgroundColor: bgColor,
                padding: '15px',
                borderRadius: '4px',
                marginBottom: '15px',
                border: `1px solid ${inputBorderColor}`,
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '15px',
                  marginBottom: '15px',
                }}
              >
                {/* OT SearchableSelect */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Orden de Trabajo *</label>
                  <SearchableSelect
                    options={otOptions}
                    value={detalle.otId}
                    onChange={(v) => handleChangeDetalle(index, 'otId', v)}
                    placeholder="Buscar por ID o descripción..."
                    disabled={loading}
                    inputBg={inputBgColor}
                    inputBorder={inputBorderColor}
                    textColor={textColor}
                  />
                </div>

                {/* Fecha y Hora Inicio */}
                <div>
                  <label style={labelStyle}>Fecha y Hora Inicio *</label>
                  <input
                    type="datetime-local"
                    value={detalle.horaInicio}
                    onChange={(e) =>
                      handleChangeDetalle(index, 'horaInicio', e.target.value)
                    }
                    disabled={loading}
                    style={inputStyle}
                  />
                </div>

                {/* Fecha y Hora Finalización */}
                <div>
                  <label style={labelStyle}>Fecha y Hora Finalización *</label>
                  <input
                    type="datetime-local"
                    value={detalle.horaFinalización}
                    onChange={(e) =>
                      handleChangeDetalle(
                        index,
                        'horaFinalización',
                        e.target.value,
                      )
                    }
                    disabled={loading}
                    style={inputStyle}
                  />
                </div>

                {/* Observaciones */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Observaciones</label>
                  <textarea
                    value={detalle.observaciones}
                    onChange={(e) =>
                      handleChangeDetalle(
                        index,
                        'observaciones',
                        e.target.value,
                      )
                    }
                    disabled={loading}
                    style={{
                      ...inputStyle,
                      minHeight: '80px',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
              </div>

              {detalles.length > 1 && (
                <button
                  onClick={() => removeDetalle(index)}
                  disabled={loading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: errorColor,
                    color: '#FFF',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  <FaTrash /> Remover
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Botón Guardar */}
        <button
          onClick={handleGuardarInforme}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: successColor,
            color: '#FFF',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            width: '100%',
            justifyContent: 'center',
          }}
        >
          <FaSave /> {loading ? 'Guardando...' : 'Guardar Informe'}
        </button>
      </div>
    </div>
  );
}
