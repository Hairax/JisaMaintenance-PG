import React from 'react';
import { FaChevronRight, FaInbox } from 'react-icons/fa';

export interface MobileCard {
  id: number | string;
  titulo: React.ReactNode;
  subtitulo?: React.ReactNode;
  /** Valor destacado a la derecha (ej. total, fecha). */
  derecha?: React.ReactNode;
  badge?: React.ReactNode;
  datos?: { label: string; value: React.ReactNode }[];
  onClick?: () => void;
  /** Botones propios de la fila (se muestran bajo los datos). */
  acciones?: React.ReactNode;
}

// Versión móvil de las tablas con diseño propio (compras, salidas,
// informes, programaciones): una tarjeta por fila, visible solo por debajo
// de `md`. La tabla original se oculta en ese tamaño con 'hidden md:block'.
export function MobileCardList({
  items,
  vacio,
}: {
  items: MobileCard[];
  vacio: string;
}) {
  if (items.length === 0) {
    return (
      <div
        className="md:hidden px-4 py-10 flex flex-col items-center gap-2 text-sm text-center"
        style={{ color: 'var(--app-text-subtle)' }}
      >
        <FaInbox className="text-2xl opacity-60" />
        {vacio}
      </div>
    );
  }

  return (
    <ul className="md:hidden">
      {items.map((it) => {
        const cuerpo = (
          <>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-semibold break-words">
                    {it.titulo}
                  </div>
                  {it.subtitulo && (
                    <div
                      className="text-xs mt-0.5 break-words"
                      style={{ color: 'var(--app-text-muted)' }}
                    >
                      {it.subtitulo}
                    </div>
                  )}
                </div>
                {(it.derecha || it.badge) && (
                  <div className="shrink-0 text-right flex flex-col items-end gap-1">
                    {it.derecha && (
                      <div className="text-sm font-bold whitespace-nowrap">
                        {it.derecha}
                      </div>
                    )}
                    {it.badge}
                  </div>
                )}
              </div>
              {it.datos && it.datos.length > 0 && (
                <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
                  {it.datos.map((d) => (
                    <div key={d.label} className="min-w-0">
                      <dt
                        className="text-[10.5px] uppercase tracking-wide"
                        style={{ color: 'var(--app-text-subtle)' }}
                      >
                        {d.label}
                      </dt>
                      <dd className="text-xs break-words">{d.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
            {it.onClick && (
              <FaChevronRight
                className="shrink-0 text-xs opacity-50 self-center"
                style={{ color: 'var(--app-brand-accent)' }}
              />
            )}
          </>
        );
        return (
          <li
            key={it.id}
            className="border-t first:border-t-0"
            style={{ borderColor: 'var(--app-border-soft)' }}
          >
            {it.onClick ? (
              <button
                type="button"
                onClick={it.onClick}
                className="w-full text-left px-4 py-3.5 flex gap-3 transition-colors hover:bg-[var(--app-row-hover)] active:bg-[var(--app-row-hover)]"
                style={{ color: 'var(--app-text)' }}
              >
                {cuerpo}
              </button>
            ) : (
              <div
                className="px-4 py-3.5 flex gap-3"
                style={{ color: 'var(--app-text)' }}
              >
                {cuerpo}
              </div>
            )}
            {it.acciones && (
              <div className="px-4 pb-3 -mt-1 flex flex-wrap gap-2">
                {it.acciones}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
