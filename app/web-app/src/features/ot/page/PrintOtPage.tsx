import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaPrint, FaTimes } from 'react-icons/fa';
import { OrdenTrabajo } from '../types/ot.types';
import { API_URL } from '../../../shared/config/api';

const API = API_URL;

const colors = {
  brown: '#9E5533',
  gold: '#FBAF11',
  darkText: '#1A1A1A',
  lightGray: '#666',
  border: '#CCCCCC',
};

const getName = (obj?: { nombre?: string; name?: string } | null) =>
  obj?.nombre ?? obj?.name ?? '—';

const fmtDate = (d?: string | Date | null) => {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const fmtDateTime = (d?: string | Date | null) => {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Campo con etiqueta arriba y valor abajo, para la grilla de datos.
function Campo({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: '6px 10px' }}>
      <div
        style={{
          fontSize: '9.5px',
          textTransform: 'uppercase',
          letterSpacing: '0.03em',
          color: colors.lightGray,
          marginBottom: '2px',
        }}
      >
        {label}
      </div>
      <div
        style={{ fontSize: '13px', color: colors.darkText, fontWeight: 600 }}
      >
        {value}
      </div>
    </div>
  );
}

export default function PrintOtPage() {
  const { id } = useParams<{ id: string }>();
  const [ot, setOt] = useState<OrdenTrabajo | null>(null);
  const [tecnicoNombres, setTecnicoNombres] = useState<Record<number, string>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      setError('');
      try {
        const [resOt, resUsers] = await Promise.all([
          fetch(`${API}/ots/${id}`),
          fetch(`${API}/users`),
        ]);
        if (!resOt.ok) throw new Error('No se pudo cargar la OT');
        const data: OrdenTrabajo = await resOt.json();
        setOt(data);

        const users = resUsers.ok ? await resUsers.json() : [];
        setTecnicoNombres(
          Object.fromEntries(
            (Array.isArray(users) ? users : []).map(
              (u: { id: number; name?: string; lastName?: string }) => [
                u.id,
                `${u.name ?? ''} ${u.lastName ?? ''}`.trim(),
              ],
            ),
          ),
        );
      } catch (err) {
        console.error(err);
        setError('Error al cargar la orden de trabajo.');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id]);

  // El navegador usa document.title tanto para el encabezado de impresión
  // como para el nombre sugerido al guardar como PDF — sin esto quedaba el
  // título por defecto de Vite en ambos lugares.
  useEffect(() => {
    if (ot) document.title = `OT ${ot.id} - Orden de Trabajo`;
  }, [ot]);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
        Cargando orden de trabajo...
      </div>
    );
  }

  if (error || !ot) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#C62828' }}>
        {error || 'Orden de trabajo no encontrada.'}
      </div>
    );
  }

  const nombresTecnicos = (ot.tecnicos ?? []).map(
    (tid) => tecnicoNombres[tid] || `Técnico #${tid}`,
  );

  return (
    <div
      style={{
        background: '#EEE',
        minHeight: '100vh',
      }}
    >
      {/* Barra de acciones — no se imprime */}
      <div
        className="no-print"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          padding: '14px',
          background: '#333',
        }}
      >
        <button
          onClick={() => window.print()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.55rem 1.4rem',
            borderRadius: 8,
            background: colors.gold,
            color: '#1A1A1A',
            border: 'none',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <FaPrint /> Imprimir
        </button>
        <button
          onClick={() => window.close()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.55rem 1.4rem',
            borderRadius: 8,
            background: 'transparent',
            color: '#FFF',
            border: '1px solid #888',
            cursor: 'pointer',
          }}
        >
          <FaTimes /> Cerrar
        </button>
      </div>

      {/* Hoja imprimible */}
      <div
        style={{
          maxWidth: '780px',
          margin: '24px auto',
          background: '#FFF',
          padding: '32px 36px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
          color: colors.darkText,
          fontFamily: 'Arial, Helvetica, sans-serif',
        }}
        id="hoja-ot"
      >
        {/* Encabezado */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: `3px solid ${colors.brown}`,
            paddingBottom: '14px',
            marginBottom: '18px',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '11px',
                color: colors.lightGray,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Jacha Inti
            </div>
            <h1
              style={{
                margin: '2px 0 0',
                fontSize: '22px',
                color: colors.brown,
              }}
            >
              Orden de Trabajo
            </h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: colors.darkText,
              }}
            >
              OT #{ot.id}
            </div>
            <div
              style={{
                display: 'inline-block',
                marginTop: '4px',
                padding: '2px 10px',
                borderRadius: 10,
                fontSize: '12px',
                fontWeight: 700,
                border: `1.5px solid ${colors.brown}`,
                color: colors.brown,
              }}
            >
              {ot.estado ?? '—'}
            </div>
          </div>
        </div>

        {/* Grilla de datos generales */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            border: `1px solid ${colors.border}`,
            borderRadius: '6px',
            overflow: 'hidden',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              borderRight: `1px solid ${colors.border}`,
              borderBottom: `1px solid ${colors.border}`,
            }}
          >
            <Campo
              label="Centro de Costo"
              value={ot.costCenter?.name || ot.centroCosto?.nombre || '—'}
            />
          </div>
          <div style={{ borderBottom: `1px solid ${colors.border}` }}>
            <Campo label="Proceso" value={getName(ot.proceso)} />
          </div>

          <div
            style={{
              borderRight: `1px solid ${colors.border}`,
              borderBottom: `1px solid ${colors.border}`,
            }}
          >
            <Campo label="Máquina" value={getName(ot.maquina)} />
          </div>
          <div style={{ borderBottom: `1px solid ${colors.border}` }}>
            <Campo
              label="Subunidad"
              value={ot.subUnidad ? getName(ot.subUnidad) : '—'}
            />
          </div>

          <div
            style={{
              borderRight: `1px solid ${colors.border}`,
              borderBottom: `1px solid ${colors.border}`,
            }}
          >
            <Campo label="Departamento" value={getName(ot.departamento)} />
          </div>
          <div style={{ borderBottom: `1px solid ${colors.border}` }}>
            <Campo label="Objeto / Activo" value={getName(ot.objeto)} />
          </div>

          <div
            style={{
              borderRight: `1px solid ${colors.border}`,
              borderBottom: `1px solid ${colors.border}`,
            }}
          >
            <Campo label="Tipo de Mantenimiento" value={getName(ot.tipoOT)} />
          </div>
          <div style={{ borderBottom: `1px solid ${colors.border}` }}>
            <Campo label="Tipo de Ejecución" value={ot.tipoEjecucion || '—'} />
          </div>

          <div style={{ borderRight: `1px solid ${colors.border}` }}>
            <Campo label="Fecha Programada" value={fmtDateTime(ot.fechaHora)} />
          </div>
          <div>
            <Campo
              label="Tiempo Estimado"
              value={ot.tiempoEstimado ? `${ot.tiempoEstimado} h` : '—'}
            />
          </div>
        </div>

        {/* Descripción */}
        <div style={{ marginBottom: '14px' }}>
          <div
            style={{
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              color: colors.lightGray,
              marginBottom: '4px',
            }}
          >
            Descripción del Trabajo Solicitado
          </div>
          <div
            style={{
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              padding: '10px 12px',
              fontSize: '13px',
              minHeight: '48px',
              whiteSpace: 'pre-wrap',
            }}
          >
            {ot.descripcionTarea || '—'}
          </div>
        </div>

        {ot.indicacionesEspeciales && (
          <div style={{ marginBottom: '14px' }}>
            <div
              style={{
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
                color: colors.lightGray,
                marginBottom: '4px',
              }}
            >
              Indicaciones Especiales
            </div>
            <div
              style={{
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                padding: '10px 12px',
                fontSize: '13px',
                whiteSpace: 'pre-wrap',
              }}
            >
              {ot.indicacionesEspeciales}
            </div>
          </div>
        )}

        {/* Supervisor */}
        <div
          style={{
            border: `1px solid ${colors.border}`,
            borderRadius: '6px',
            overflow: 'hidden',
            marginBottom: '14px',
          }}
        >
          <Campo label="Supervisor" value={getName(ot.supervisor)} />
        </div>

        {/* Técnicos asignados — lista, escala a cualquier cantidad */}
        <div style={{ marginBottom: '20px' }}>
          <div
            style={{
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              color: colors.lightGray,
              marginBottom: '4px',
            }}
          >
            Técnico(s) Asignado(s) ({nombresTecnicos.length})
          </div>
          <div
            style={{
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              padding: nombresTecnicos.length ? '4px 12px' : '10px 12px',
              fontSize: '13px',
            }}
          >
            {nombresTecnicos.length === 0 ? (
              '—'
            ) : (
              <ol style={{ margin: 0, paddingLeft: '18px' }}>
                {nombresTecnicos.map((nombre, i) => (
                  <li key={i} style={{ padding: '4px 0' }}>
                    {nombre}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        {/* Fechas de trazabilidad */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: colors.lightGray,
            marginBottom: '30px',
            paddingBottom: '10px',
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <span>Fecha de Creación: {fmtDate(ot.fechaCreacion)}</span>
          {ot.estado === 'Cerrada' && (
            <span>Fecha de Cierre: {fmtDate(ot.fechaCierre)}</span>
          )}
          <span>Impreso: {fmtDateTime(new Date())}</span>
        </div>

        {/* Firmas: una línea por cada técnico asignado (para que cada uno
            pueda firmar su propia participación), más supervisor y jefe de
            mantenimiento. Si hay muchos técnicos, la grilla arma más filas
            sola — no depende de un número fijo de columnas. */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '24px 20px',
            marginTop: '40px',
          }}
        >
          {(nombresTecnicos.length > 0
            ? nombresTecnicos.map((nombre) => `${nombre} — Técnico`)
            : ['Técnico Responsable']
          ).map((label, i) => (
            <div
              key={`tec-${i}`}
              style={{ textAlign: 'center', breakInside: 'avoid' }}
            >
              <div
                style={{
                  borderTop: `1px solid ${colors.darkText}`,
                  paddingTop: '6px',
                  fontSize: '11px',
                  color: colors.darkText,
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '24px 20px',
            marginTop: '30px',
          }}
        >
          {['Supervisor de Área', 'Vo.Bo. Jefe de Mantenimiento'].map(
            (label) => (
              <div
                key={label}
                style={{ textAlign: 'center', breakInside: 'avoid' }}
              >
                <div
                  style={{
                    borderTop: `1px solid ${colors.darkText}`,
                    paddingTop: '6px',
                    fontSize: '11px',
                    color: colors.darkText,
                  }}
                >
                  {label}
                </div>
              </div>
            ),
          )}
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #FFF !important; }
          #hoja-ot {
            box-shadow: none !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
        }
        @page {
          size: A4;
          margin: 14mm;
        }
      `}</style>
    </div>
  );
}
