import React from 'react';
import { FaChevronRight, FaInbox, FaSearch } from 'react-icons/fa';
import { useBusquedaActiva } from './busquedaContext';

export interface Columna<T> {
  header: string;
  render: (row: T) => React.ReactNode;
  /** Clases extra para la celda (ej. 'font-medium', 'hidden md:table-cell'). */
  className?: string;
}

interface ManagementTableProps<T extends { id: number }> {
  rows: T[];
  columns: Columna<T>[];
  onRowClick: (row: T) => void;
  loading: boolean;
  error: string | null;
  /** Mensaje cuando no hay ningún registro (sin búsqueda activa). */
  emptyMessage: string;
  /** Estilo extra por fila (ej. usuarios inactivos atenuados). */
  rowStyle?: (row: T) => React.CSSProperties | undefined;
}

const CELDA = 'px-4 py-3 text-sm align-middle';

// Columnas marcadas como ocultables en pantallas medianas ('hidden md:…',
// 'hidden lg:…') son secundarias: no se muestran en la tarjeta móvil.
const esSecundaria = (c: { className?: string }) =>
  /(^|\s)hidden(\s|$)/.test(c.className ?? '');

// Tabla estándar de las vistas de gestión: encabezado beige/café, filas
// clicables (abren el detalle), y estados de carga, vacío y error.
export function ManagementTable<T extends { id: number }>({
  rows,
  columns,
  onRowClick,
  loading,
  error,
  emptyMessage,
  rowStyle,
}: ManagementTableProps<T>) {
  const busqueda = useBusquedaActiva();
  const cargandoInicial = loading && rows.length === 0;

  return (
    <div className="overflow-x-auto">
      {error && (
        <div
          className="mx-4 mt-4 px-4 py-3 rounded-lg text-sm border"
          style={{
            background: 'rgba(211, 47, 47, 0.08)',
            borderColor: 'rgba(211, 47, 47, 0.35)',
            color: '#D32F2F',
          }}
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Móvil: tarjetas resumidas (primera columna + nombre como título y
          el resto de columnas visibles como "etiqueta: valor"). */}
      <ul className="md:hidden">
        {cargandoInicial &&
          Array.from({ length: 4 }).map((_, i) => (
            <li
              key={`skm-${i}`}
              className="px-4 py-4 border-t first:border-t-0 space-y-2"
              style={{ borderColor: 'var(--app-border-soft)' }}
            >
              {[40, 75, 60].map((w) => (
                <div
                  key={w}
                  className="h-3 rounded animate-pulse"
                  style={{
                    width: `${w}%`,
                    background:
                      'color-mix(in srgb, var(--app-text) 10%, transparent)',
                  }}
                />
              ))}
            </li>
          ))}
        {!cargandoInicial &&
          rows.map((row) => {
            const [c0, c1, ...resto] = columns;
            const detalle = resto.filter((c) => !esSecundaria(c));
            return (
              <li
                key={row.id}
                className="border-t first:border-t-0"
                style={{ borderColor: 'var(--app-border-soft)' }}
              >
                <button
                  type="button"
                  onClick={() => onRowClick(row)}
                  className="w-full text-left px-4 py-3.5 flex items-center gap-3 transition-colors active:bg-[var(--app-row-hover)] hover:bg-[var(--app-row-hover)]"
                  style={rowStyle?.(row)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 min-w-0">
                      {c0 && (
                        <span
                          className="text-xs font-semibold shrink-0"
                          style={{ color: 'var(--app-brand-accent)' }}
                        >
                          {c0.render(row)}
                        </span>
                      )}
                      {c1 && (
                        <span className="text-sm font-semibold min-w-0 break-words">
                          {c1.render(row)}
                        </span>
                      )}
                    </div>
                    {detalle.length > 0 && (
                      <dl className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1">
                        {detalle.map((c) => (
                          <div key={c.header} className="min-w-0">
                            <dt
                              className="text-[10.5px] uppercase tracking-wide"
                              style={{ color: 'var(--app-text-subtle)' }}
                            >
                              {c.header}
                            </dt>
                            <dd className="text-xs break-words">
                              {c.render(row)}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </div>
                  <FaChevronRight
                    className="shrink-0 text-xs opacity-50"
                    style={{ color: 'var(--app-brand-accent)' }}
                  />
                </button>
              </li>
            );
          })}
        {!cargandoInicial && rows.length === 0 && (
          <li
            className="px-4 py-12 flex flex-col items-center gap-2 text-sm text-center"
            style={{ color: 'var(--app-text-subtle)' }}
          >
            {busqueda ? (
              <FaSearch className="text-2xl opacity-60" />
            ) : (
              <FaInbox className="text-2xl opacity-60" />
            )}
            {busqueda
              ? `Ningún registro coincide con “${busqueda}”.`
              : emptyMessage}
          </li>
        )}
      </ul>

      <table className="hidden md:table w-full border-collapse">
        <thead
          style={{
            background: 'var(--app-head-bg)',
            color: 'var(--app-head-text)',
          }}
        >
          <tr>
            {columns.map((c) => (
              <th
                key={c.header}
                scope="col"
                className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap ${c.className ?? ''}`}
              >
                {c.header}
              </th>
            ))}
            <th className="w-10" aria-label="Ver detalle" />
          </tr>
        </thead>
        <tbody>
          {cargandoInicial &&
            Array.from({ length: 5 }).map((_, i) => (
              <tr
                key={`sk-${i}`}
                className="border-t"
                style={{ borderColor: 'var(--app-border-soft)' }}
              >
                {columns.map((c) => (
                  <td
                    key={c.header}
                    className={`${CELDA} ${c.className ?? ''}`}
                  >
                    <div
                      className="h-3.5 rounded animate-pulse"
                      style={{
                        background:
                          'color-mix(in srgb, var(--app-text) 10%, transparent)',
                        width: `${50 + ((i * 17 + c.header.length * 7) % 45)}%`,
                      }}
                    />
                  </td>
                ))}
                <td />
              </tr>
            ))}

          {!cargandoInicial &&
            rows.map((row) => (
              <tr
                key={row.id}
                tabIndex={0}
                onClick={() => onRowClick(row)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onRowClick(row);
                  }
                }}
                className="group border-t cursor-pointer transition-colors hover:bg-[var(--app-row-hover)] focus:bg-[var(--app-row-hover)] focus:outline-none"
                style={{
                  borderColor: 'var(--app-border-soft)',
                  ...rowStyle?.(row),
                }}
              >
                {columns.map((c) => (
                  <td
                    key={c.header}
                    className={`${CELDA} ${c.className ?? ''}`}
                  >
                    {c.render(row)}
                  </td>
                ))}
                <td className="pr-4 text-right">
                  <FaChevronRight
                    className="inline text-xs opacity-30 transition group-hover:opacity-80 group-hover:translate-x-0.5"
                    style={{ color: 'var(--app-brand-accent)' }}
                  />
                </td>
              </tr>
            ))}

          {!cargandoInicial && rows.length === 0 && (
            <tr>
              <td colSpan={columns.length + 1} className="px-4 py-14">
                <div
                  className="flex flex-col items-center gap-2 text-sm"
                  style={{ color: 'var(--app-text-subtle)' }}
                >
                  {busqueda ? (
                    <FaSearch className="text-2xl opacity-60" />
                  ) : (
                    <FaInbox className="text-2xl opacity-60" />
                  )}
                  {busqueda
                    ? `Ningún registro coincide con “${busqueda}”.`
                    : emptyMessage}
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
