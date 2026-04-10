import { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { useTheme } from '../../../shared/contexts/ThemeContext';

const API = 'http://localhost:3000';

interface Repuesto {
  id: number;
  nombre: string;
  cantidad: number;
  stockCritico: number;
  centroCosto_id?: number;
  proceso_id?: number;
  maquina_id?: number;
  subUnidad_id?: number;
  correlativo?: number;
}

export const HomePage = () => {
  const { logout } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [criticalRepuestos, setCriticalRepuestos] = useState<Repuesto[]>([]);

  useEffect(() => {
    fetch(`${API}/repuestos`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Repuesto[]) => {
        if (Array.isArray(data)) {
          setCriticalRepuestos(
            data.filter(
              (r) => r.stockCritico != null && r.cantidad <= r.stockCritico,
            ),
          );
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div
      className={`min-h-screen p-6 ${isDark ? 'bg-dark' : 'bg-light'}`}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1
            className={`text-2xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            Bienvenido a Jisa Maintenance
          </h1>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* ── Critical Stock Alert ─────────────────────────────────────────── */}
        {criticalRepuestos.length > 0 && (
          <div
            style={{
              backgroundColor: isDark ? '#4A0000' : '#FFF5F5',
              border: '3px solid #E53E3E',
              borderRadius: 10,
              padding: '20px 24px',
            }}
          >
            {/* Alert header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                marginBottom: 18,
              }}
            >
              <span style={{ fontSize: 36, lineHeight: 1 }}>⚠️</span>
              <div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: isDark ? '#FF6B6B' : '#C53030',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}
                >
                  Alerta de Stock Crítico
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: isDark ? '#FFA0A0' : '#E53E3E',
                    marginTop: 2,
                  }}
                >
                  {criticalRepuestos.length} repuesto
                  {criticalRepuestos.length > 1 ? 's' : ''} con stock por
                  debajo o igual al umbral crítico
                </div>
              </div>
            </div>

            {/* Alert cards grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: 12,
              }}
            >
              {criticalRepuestos.map((r) => (
                <div
                  key={r.id}
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(229,62,62,0.12)'
                      : 'rgba(229,62,62,0.07)',
                    border: '1px solid #FC8181',
                    borderRadius: 8,
                    padding: '12px 16px',
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 15,
                      color: isDark ? '#FFF' : '#1A1A1A',
                      marginBottom: 8,
                    }}
                  >
                    {r.nombre}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: 16,
                      fontSize: 13,
                      color: isDark ? '#CCC' : '#555',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          color: isDark ? '#999' : '#888',
                          marginBottom: 2,
                        }}
                      >
                        STOCK ACTUAL
                      </div>
                      <div
                        style={{
                          fontSize: 22,
                          fontWeight: 800,
                          color: '#E53E3E',
                          lineHeight: 1,
                        }}
                      >
                        {r.cantidad}
                      </div>
                    </div>
                    <div
                      style={{
                        width: 1,
                        backgroundColor: isDark ? '#5C2020' : '#FCA5A5',
                        alignSelf: 'stretch',
                      }}
                    />
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          color: isDark ? '#999' : '#888',
                          marginBottom: 2,
                        }}
                      >
                        STOCK CRÍTICO
                      </div>
                      <div
                        style={{
                          fontSize: 22,
                          fontWeight: 800,
                          color: isDark ? '#F6AD55' : '#C05621',
                          lineHeight: 1,
                        }}
                      >
                        {r.stockCritico}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          className={`p-6 rounded-lg shadow ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <p className={isDark ? 'text-gray-200' : 'text-gray-700'}>
            Esta es la página principal de Jisa Maintenance. Aquí podrás
            gestionar todas las operaciones de mantenimiento.
          </p>
        </div>
      </div>
    </div>
  );
};
