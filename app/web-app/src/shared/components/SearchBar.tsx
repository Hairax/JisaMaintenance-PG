import { FaSearch, FaTimes } from 'react-icons/fa';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  total: number;
  resultados: number;
  // Para usarlo dentro de un contenedor que ya tiene su padding.
  sinContenedor?: boolean;
}

// Buscador de las vistas de gestión. Usa los tokens de color de index.css
// (sigue el modo oscuro solo).
export function SearchBar({
  value,
  onChange,
  placeholder,
  total,
  resultados,
  sinContenedor = false,
}: SearchBarProps) {
  return (
    <div
      className={
        sinContenedor
          ? 'w-full'
          : 'w-full px-4 sm:px-6 lg:px-8 max-w-screen-xl mx-auto mb-3'
      }
    >
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <FaSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
            style={{ color: 'var(--app-text-subtle)' }}
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            className="w-full pl-9 pr-9 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#FBAF11]/50 focus:border-[#FBAF11]"
            style={{
              backgroundColor: 'var(--app-input-bg)',
              borderColor: 'var(--app-border)',
              color: 'var(--app-text)',
            }}
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm hover:opacity-70"
              style={{ color: 'var(--app-text-subtle)' }}
              aria-label="Limpiar búsqueda"
            >
              <FaTimes />
            </button>
          )}
        </div>
        <span
          className="text-xs whitespace-nowrap"
          style={{ color: 'var(--app-text-subtle)' }}
        >
          {value
            ? `${resultados} de ${total} registros`
            : `${total} ${total === 1 ? 'registro' : 'registros'}`}
        </span>
      </div>
    </div>
  );
}
