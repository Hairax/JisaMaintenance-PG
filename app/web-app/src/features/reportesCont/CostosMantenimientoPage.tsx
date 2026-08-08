import { useCallback, useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { minutosTrabajados, costoManoObra } from '../../shared/utils/laborCost';

const API = 'http://localhost:3000';

// ── Types ─────────────────────────────────────────────────────────────────────

interface OT {
  id: number;
  descripcionTarea: string;
  estado: string;
  fechaHora: string;
  fechaCreacion: string;
  tipoOT?: { nombre?: string; name?: string };
  costCenter?: { nombre?: string; name?: string };
  proceso?: { nombre?: string; name?: string };
  maquina?: { nombre?: string; name?: string };
  departamento?: { nombre?: string; name?: string };
}

interface Salida {
  id: number;
  otId: number;
  total: number;
  fecha: string;
}

interface InformeDetalle {
  id: number;
  otId: number;
  horaInicio: string;
  horaFinalización: string;
}

interface Informe {
  id: number;
  userId: number;
  detalles: InformeDetalle[];
}

interface Usuario {
  id: number;
  name: string;
  lastName: string;
  hora$?: number | null;
  minutos$?: number | null;
}

interface MantenimientoRow {
  id: number;
  fecha: string;
  tipo: string;
  centroCosto: string;
  descripcion: string;
  estado: string;
  horasTrabajadas: number;
  costoManoObra: number;
  costoMateriales: number;
  costoTotal: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const getNombre = (obj?: { nombre?: string; name?: string }): string =>
  obj?.nombre ?? obj?.name ?? '—';

const fmtDate = (d: string): string => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const fmtCurrency = (n: number): string =>
  n.toLocaleString('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const fmtHours = (h: number): string => {
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return `${hrs}h ${mins.toString().padStart(2, '0')}m`;
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function CostosMantenimientoPage() {
  const [rows, setRows] = useState<MantenimientoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tipoFiltro, setTipoFiltro] = useState('');

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [resOTs, resSalidas, resInformes, resUsers] = await Promise.all([
        fetch(`${API}/ots`),
        fetch(`${API}/salidas`),
        fetch(`${API}/informes`),
        fetch(`${API}/users`),
      ]);

      const [ots, salidas, informes, users] = (await Promise.all([
        resOTs.ok ? resOTs.json() : Promise.resolve([]),
        resSalidas.ok ? resSalidas.json() : Promise.resolve([]),
        resInformes.ok ? resInformes.json() : Promise.resolve([]),
        resUsers.ok ? resUsers.json() : Promise.resolve([]),
      ])) as [OT[], Salida[], Informe[], Usuario[]];

      const salidaMap: Record<number, number> = {};
      for (const s of Array.isArray(salidas) ? salidas : []) {
        const otId = Number(s.otId);
        salidaMap[otId] = (salidaMap[otId] ?? 0) + Number(s.total);
      }

      const userMap: Record<number, Usuario> = {};
      for (const u of Array.isArray(users) ? users : []) {
        userMap[u.id] = u;
      }

      // Horas y costo de mano de obra por OT, a partir de los detalles de
      // informe diario (horaInicio / horaFinalización) y la tarifa del
      // técnico que registró el trabajo (hora$ o minutos$).
      const horasPorOT: Record<number, number> = {};
      const manoObraPorOT: Record<number, number> = {};
      for (const inf of Array.isArray(informes) ? informes : []) {
        for (const det of inf.detalles ?? []) {
          const otId = Number(det.otId);
          const minutos = minutosTrabajados(
            det.horaInicio,
            det['horaFinalización'],
          );
          horasPorOT[otId] = (horasPorOT[otId] ?? 0) + minutos / 60;
          manoObraPorOT[otId] =
            (manoObraPorOT[otId] ?? 0) +
            costoManoObra(userMap[inf.userId], minutos);
        }
      }

      const data: MantenimientoRow[] = (Array.isArray(ots) ? ots : []).map(
        (ot) => {
          const costoMateriales = salidaMap[ot.id] ?? 0;
          const costoManoObraOT = manoObraPorOT[ot.id] ?? 0;
          return {
            id: ot.id,
            fecha: (ot.fechaHora ?? ot.fechaCreacion ?? '').slice(0, 10),
            tipo: getNombre(ot.tipoOT),
            centroCosto: getNombre(ot.costCenter),
            descripcion: ot.descripcionTarea,
            estado: ot.estado,
            horasTrabajadas: horasPorOT[ot.id] ?? 0,
            costoManoObra: costoManoObraOT,
            costoMateriales,
            costoTotal: costoManoObraOT + costoMateriales,
          };
        },
      );

      setRows(data);
    } catch (err) {
      console.error(err);
      setError(
        'Error al cargar los datos. Verifique la conexión con el servidor.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const tiposUnicos = useMemo(
    () => Array.from(new Set(rows.map((r) => r.tipo).filter((t) => t !== '—'))),
    [rows],
  );

  const dataFiltrada = useMemo(
    () => (tipoFiltro ? rows.filter((r) => r.tipo === tipoFiltro) : rows),
    [rows, tipoFiltro],
  );

  const costoManoObraGlobal = useMemo(
    () => dataFiltrada.reduce((s, r) => s + r.costoManoObra, 0),
    [dataFiltrada],
  );

  const costoMaterialesGlobal = useMemo(
    () => dataFiltrada.reduce((s, r) => s + r.costoMateriales, 0),
    [dataFiltrada],
  );

  const costoTotalGlobal = useMemo(
    () => dataFiltrada.reduce((s, r) => s + r.costoTotal, 0),
    [dataFiltrada],
  );

  const exportarExcel = () => {
    const datosParaExportar = dataFiltrada.map((item) => ({
      'N° OT': item.id,
      Fecha: item.fecha,
      Tipo: item.tipo,
      'Centro de Costo': item.centroCosto,
      Descripción: item.descripcion,
      Estado: item.estado,
      'Horas Trabajadas': item.horasTrabajadas.toFixed(2),
      'Costo Mano de Obra (Bs)': item.costoManoObra.toFixed(2),
      'Costo Materiales (Bs)': item.costoMateriales.toFixed(2),
      'Costo Total (Bs)': item.costoTotal.toFixed(2),
    }));

    const hoja = XLSX.utils.json_to_sheet(datosParaExportar);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Mantenimiento');
    XLSX.writeFile(libro, 'reporte_costos_mantenimiento.xlsx');
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
        Cargando datos de mantenimiento...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#D32F2F', marginBottom: 12 }}>{error}</p>
        <button
          onClick={cargarDatos}
          style={{
            padding: '0.5rem 1.2rem',
            borderRadius: 8,
            background: '#FBAF11',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 'clamp(1rem, 4vw, 2rem)',
        maxWidth: 1000,
        margin: '0 auto',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          padding: 'clamp(1rem, 4vw, 2rem)',
        }}
      >
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            marginBottom: '1.5rem',
          }}
        >
          Reporte de Costos y Gastos de Mantenimiento
        </h2>

        {/* Filtros */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            alignItems: 'flex-end',
            marginBottom: 24,
            flexWrap: 'wrap',
          }}
        >
          <select
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 8,
              border: '1px solid #ccc',
              maxWidth: 300,
            }}
          >
            <option value="">Todos los tipos</option>
            {tiposUnicos.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
          <button
            onClick={() => setTipoFiltro('')}
            style={{
              padding: '0.5rem 1.2rem',
              borderRadius: 8,
              background: '#FBAF11',
              color: '#fff',
              border: 'none',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Limpiar
          </button>
          <button
            onClick={cargarDatos}
            style={{
              padding: '0.5rem 1.2rem',
              borderRadius: 8,
              background: '#1565C0',
              color: '#fff',
              border: 'none',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Actualizar
          </button>
          <button
            onClick={exportarExcel}
            style={{
              padding: '0.5rem 1.2rem',
              borderRadius: 8,
              background: '#4CAF50',
              color: '#fff',
              border: 'none',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Exportar a Excel
          </button>
        </div>

        {/* Tarjeta resumen */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            marginBottom: 24,
            flexWrap: 'wrap',
          }}
        >
          {[
            { label: 'Total OTs', value: dataFiltrada.length },
            {
              label: 'Costo Mano de Obra (Bs)',
              value: `Bs ${fmtCurrency(costoManoObraGlobal)}`,
            },
            {
              label: 'Costo Materiales (Bs)',
              value: `Bs ${fmtCurrency(costoMaterialesGlobal)}`,
            },
            {
              label: 'Costo Total (Bs)',
              value: `Bs ${fmtCurrency(costoTotalGlobal)}`,
            },
            {
              label: 'OTs sin costo registrado',
              value: dataFiltrada.filter((r) => r.costoTotal === 0).length,
            },
          ].map((c) => (
            <div
              key={c.label}
              style={{
                flex: 1,
                minWidth: 160,
                background: '#F5F5F5',
                borderRadius: 10,
                padding: '1rem',
                textAlign: 'center',
              }}
            >
              <div
                style={{ fontSize: '1.4rem', fontWeight: 700, color: '#333' }}
              >
                {c.value}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#777', marginTop: 4 }}>
                {c.label}
              </div>
            </div>
          ))}
        </div>

        {/* Tabla */}
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '1rem',
            }}
          >
            <thead>
              <tr style={{ background: '#E1CD9B' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>N° OT</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Fecha</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Tipo</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>
                  Centro de Costo
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>
                  Descripción
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>
                  Estado
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>
                  Horas Trab.
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>
                  Costo M.O. (Bs)
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>
                  Costo Mat. (Bs)
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>
                  Costo Total (Bs)
                </th>
              </tr>
            </thead>
            <tbody>
              {dataFiltrada.map((item, i) => (
                <tr
                  key={item.id}
                  style={{ background: i % 2 === 0 ? '#fff' : '#F5F5F5' }}
                >
                  <td style={{ padding: '0.75rem' }}>{item.id}</td>
                  <td style={{ padding: '0.75rem' }}>{fmtDate(item.fecha)}</td>
                  <td style={{ padding: '0.75rem' }}>{item.tipo}</td>
                  <td style={{ padding: '0.75rem' }}>{item.centroCosto}</td>
                  <td
                    style={{
                      padding: '0.75rem',
                      maxWidth: 260,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={item.descripcion}
                  >
                    {item.descripcion}
                  </td>
                  <td style={{ padding: '0.75rem' }}>{item.estado}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    {item.horasTrabajadas > 0
                      ? fmtHours(item.horasTrabajadas)
                      : '—'}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    {item.costoManoObra > 0
                      ? `Bs ${fmtCurrency(item.costoManoObra)}`
                      : '—'}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    {item.costoMateriales > 0
                      ? `Bs ${fmtCurrency(item.costoMateriales)}`
                      : '—'}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    {item.costoTotal > 0
                      ? `Bs ${fmtCurrency(item.costoTotal)}`
                      : '—'}
                  </td>
                </tr>
              ))}
              {dataFiltrada.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    style={{
                      padding: '1.5rem',
                      textAlign: 'center',
                      color: '#9E5533',
                    }}
                  >
                    No se encontraron resultados.
                  </td>
                </tr>
              )}
            </tbody>
            {dataFiltrada.length > 0 && (
              <tfoot>
                <tr style={{ background: '#E1CD9B', fontWeight: 700 }}>
                  <td colSpan={6} style={{ padding: '0.75rem' }}>
                    Total
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    {fmtHours(
                      dataFiltrada.reduce((s, r) => s + r.horasTrabajadas, 0),
                    )}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    Bs {fmtCurrency(costoManoObraGlobal)}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    Bs {fmtCurrency(costoMaterialesGlobal)}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    Bs {fmtCurrency(costoTotalGlobal)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
