import { useState, useEffect } from 'react';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { informeService } from '../services/informe.service';
import { FaPlus, FaTrash, FaSave } from 'react-icons/fa';

const colors = {
  brown: '#9E5533',
  beige: '#E1CD9B',
  gold: '#FBAF11',
  darkBg: '#1A1A1A',
  lightBg: '#E6E6E6',
  darkText: '#000000',
  lightText: '#FFFFFF',
};

export default function RegisterInformePage() {
  const { theme } = useTheme();

  // Colores dinámicos según tema
  const textColor = theme === 'dark' ? colors.lightText : colors.darkText;
  const secondaryTextColor = theme === 'dark' ? colors.beige : colors.brown;
  const bgColor = theme === 'dark' ? colors.darkBg : colors.lightBg;
  const inputBgColor = theme === 'dark' ? '#2A2A2A' : '#F5F5F5';
  const inputBorderColor = theme === 'dark' ? '#3A3A3A' : '#D6D6D6';
  const successColor = theme === 'dark' ? '#4ADE80' : '#22863a';
  const errorColor = '#E53E3E';
  const addButtonBg = colors.gold;
  const addButtonHover = '#E69D00';

  // Estado del informe
  const [userId, setUserId] = useState('');

  // Detalles del informe
  const [detalles, setDetalles] = useState<
    Array<{
      otId: string;
      observaciones: string;
      horaInicio: string;
      horaFinalización: string;
    }>
  >([
    {
      otId: '',
      observaciones: '',
      horaInicio: '',
      horaFinalización: '',
    },
  ]);

  const [ots, setOts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar datos del servidor al montar
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // TODO: Aquí necesitas crear estos métodos en el servicio
        // const [usrs, ots_] = await Promise.all([
        //   informeService.getUsers(),
        //   informeService.getOts(),
        // ]);
        // setUsuarios(Array.isArray(usrs) ? usrs : []);
        // setOts(Array.isArray(ots_) ? ots_ : []);
      } catch (err) {
        setError('Error al cargar datos del servidor');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Manejar cambios en los detalles
  const handleChangeDetalle = (
    index: number,
    field: keyof (typeof detalles)[0],
    value: string,
  ) => {
    const newDetalles = [...detalles];
    newDetalles[index][field] = value;
    setDetalles(newDetalles);
  };

  // Agregar nuevo detalle
  const addDetalle = () => {
    setDetalles([
      ...detalles,
      {
        otId: '',
        observaciones: '',
        horaInicio: '',
        horaFinalización: '',
      },
    ]);
  };

  // Remover detalle
  const removeDetalle = (index: number) => {
    setDetalles(detalles.filter((_, i) => i !== index));
  };

  // Guardar informe
  const handleGuardarInforme = async () => {
    if (!userId || detalles.length === 0) {
      setError('Por favor completa los campos requeridos');
      return;
    }

    // Validar que todos los detalles tengan los campos requeridos
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

      // Limpiar formulario
      setUserId('');
      setDetalles([
        {
          otId: '',
          observaciones: '',
          horaInicio: '',
          horaFinalización: '',
        },
      ]);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Error al guardar informe');
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
            <label
              style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: 'bold',
              }}
            >
              Usuario ID *
            </label>
            <input
              type="number"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              disabled={loading}
              placeholder="Ingrese el ID del usuario"
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: bgColor,
                color: textColor,
                border: `1px solid ${inputBorderColor}`,
                borderRadius: '4px',
              }}
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
                const target = e.currentTarget as HTMLButtonElement;
                if (!loading) target.style.backgroundColor = addButtonHover;
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget as HTMLButtonElement;
                target.style.backgroundColor = addButtonBg;
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
                {/* OT ID */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '5px',
                      fontWeight: 'bold',
                    }}
                  >
                    Orden de Trabajo ID *
                  </label>
                  <input
                    type="number"
                    value={detalle.otId}
                    onChange={(e) =>
                      handleChangeDetalle(index, 'otId', e.target.value)
                    }
                    disabled={loading}
                    placeholder="Ingrese ID de OT"
                    style={{
                      width: '100%',
                      padding: '10px',
                      backgroundColor: inputBgColor,
                      color: textColor,
                      border: `1px solid ${inputBorderColor}`,
                      borderRadius: '4px',
                    }}
                  />
                </div>

                {/* Hora Inicio */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '5px',
                      fontWeight: 'bold',
                    }}
                  >
                    Hora Inicio *
                  </label>
                  <input
                    type="time"
                    value={detalle.horaInicio}
                    onChange={(e) =>
                      handleChangeDetalle(index, 'horaInicio', e.target.value)
                    }
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '10px',
                      backgroundColor: inputBgColor,
                      color: textColor,
                      border: `1px solid ${inputBorderColor}`,
                      borderRadius: '4px',
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
                    }}
                  >
                    Hora Finalización *
                  </label>
                  <input
                    type="time"
                    value={detalle.horaFinalización}
                    onChange={(e) =>
                      handleChangeDetalle(
                        index,
                        'horaFinalización',
                        e.target.value,
                      )
                    }
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '10px',
                      backgroundColor: inputBgColor,
                      color: textColor,
                      border: `1px solid ${inputBorderColor}`,
                      borderRadius: '4px',
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
                    }}
                  >
                    Observaciones
                  </label>
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
                      width: '100%',
                      padding: '10px',
                      backgroundColor: inputBgColor,
                      color: textColor,
                      border: `1px solid ${inputBorderColor}`,
                      borderRadius: '4px',
                      minHeight: '80px',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
              </div>

              {/* Botón Remover */}
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
