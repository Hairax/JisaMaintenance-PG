import { FaSearch, FaTimes } from 'react-icons/fa';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  theme: string;
  total: number;
  resultados: number;
  // Para páginas que ya tienen su propio contenedor con padding.
  sinContenedor?: boolean;
}

// Buscador para las vistas de gestión (va arriba de la tabla, con el mismo
// ancho que ella).
export function SearchBar({
  value,
  onChange,
  placeholder,
  theme,
  total,
  resultados,
  sinContenedor = false,
}: SearchBarProps) {
  const isDark = theme === 'dark';
  const muted = isDark ? '#9E9E9E' : '#666666';

  return (
    <div
      className={
        sinContenedor
          ? 'w-full mt-4 mb-1'
          : 'w-full px-4 sm:px-6 lg:px-8 max-w-screen-xl mx-auto mb-3'
      }
    >
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <FaSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
            style={{ color: muted }}
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            className="w-full pl-9 pr-9 py-2 rounded-lg border text-sm focus:outline-none focus:ring-1"
            style={{
              backgroundColor: isDark ? '#2A2A2A' : '#FFFFFF',
              borderColor: isDark ? '#3A3A3A' : '#D6D6D6',
              color: isDark ? '#FFFFFF' : '#000000',
            }}
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm hover:opacity-70"
              style={{ color: muted }}
              aria-label="Limpiar búsqueda"
            >
              <FaTimes />
            </button>
          )}
        </div>
        {value && (
          <span className="text-xs" style={{ color: muted }}>
            {resultados} de {total}
          </span>
        )}
      </div>
    </div>
  );
}
