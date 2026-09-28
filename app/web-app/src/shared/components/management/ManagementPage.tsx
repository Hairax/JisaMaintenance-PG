import React from 'react';
import { FaFileExcel, FaPlus } from 'react-icons/fa';
import { SearchBar } from '../SearchBar';
import { BusquedaContext } from './busquedaContext';

// Diseño estándar de las vistas de gestión (usuarios, máquinas, objetos...):
// encabezado con ícono, título y acciones (Exportar / Agregar) siempre en el
// mismo lugar, y una tarjeta con el buscador y la tabla. Usa los tokens de
// color de index.css, así que sigue el modo oscuro sin leer el tema.

interface ManagementPageProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  total: number;
  resultados: number;
  busqueda: string;
  onBusquedaChange: (value: string) => void;
  searchPlaceholder: string;
  onExport?: () => void;
  onAdd?: () => void;
  addLabel?: string;
  children: React.ReactNode;
}

export function ManagementPage({
  title,
  subtitle,
  icon,
  total,
  resultados,
  busqueda,
  onBusquedaChange,
  searchPlaceholder,
  onExport,
  onAdd,
  addLabel,
  children,
}: ManagementPageProps) {
  return (
    <div
      className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8"
      style={{ color: 'var(--app-text)' }}
    >
      <ManagementHeader
        title={title}
        subtitle={subtitle}
        icon={icon}
        actions={
          <>
            {onExport && (
              <SecondaryButton onClick={onExport}>
                <FaFileExcel style={{ color: '#2E7D32' }} /> Exportar Excel
              </SecondaryButton>
            )}
            {onAdd && (
              <PrimaryButton onClick={onAdd}>
                <FaPlus /> {addLabel ?? 'Agregar'}
              </PrimaryButton>
            )}
          </>
        }
      />

      <section
        className="rounded-xl border overflow-hidden"
        style={{
          background: 'var(--app-surface)',
          borderColor: 'var(--app-border-soft)',
          boxShadow: 'var(--app-shadow)',
        }}
      >
        <div
          className="px-4 pt-4 pb-3 border-b"
          style={{ borderColor: 'var(--app-border-soft)' }}
        >
          <SearchBar
            value={busqueda}
            onChange={onBusquedaChange}
            placeholder={searchPlaceholder}
            total={total}
            resultados={resultados}
            sinContenedor
          />
        </div>
        <BusquedaContext.Provider value={busqueda}>
          {children}
        </BusquedaContext.Provider>
      </section>
    </div>
  );
}

// Encabezado estándar (ícono + título + descripción, acciones a la derecha).
// Se exporta para vistas de gestión con tabla propia (ej. Programación de OTs).
export function ManagementHeader({
  title,
  subtitle,
  icon,
  actions,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-4 min-w-0">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
          style={{
            background: 'var(--app-accent-soft)',
            color: 'var(--app-brand-accent)',
          }}
          aria-hidden="true"
        >
          {icon}
        </div>
        <div className="min-w-0">
          <h1
            className="text-2xl font-bold tracking-tight leading-tight"
            style={{ color: 'var(--app-text)' }}
          >
            {title}
          </h1>
          <p
            className="text-sm mt-0.5"
            style={{ color: 'var(--app-text-muted)' }}
          >
            {subtitle}
          </p>
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-wrap md:justify-end">
          {actions}
        </div>
      )}
    </header>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  style?: React.CSSProperties;
}

/** Acción principal (dorado de la marca). */
export function PrimaryButton({ className = '', ...props }: ButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition bg-[#FBAF11] hover:bg-[#E69D00] text-[#1A1A1A] disabled:opacity-60 ${className}`}
    />
  );
}

/** Acción secundaria (contorno neutro). */
export function SecondaryButton({
  className = '',
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition hover:bg-[var(--app-surface-alt)] ${className}`}
      style={{
        borderColor: 'var(--app-border)',
        background: 'var(--app-surface)',
        color: 'var(--app-text)',
        ...style,
      }}
    />
  );
}
