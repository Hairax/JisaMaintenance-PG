// URL base del api-gateway.
//
// El servidor corre dentro de la red de la empresa y se accede tanto desde
// la LAN (ej. http://192.168.x.x:5173) como remotamente vía VPN hacia esa
// misma red. Como las variables VITE_* quedan fijas dentro del build (no se
// leen en el navegador del usuario), NO conviene fijar acá una IP: en su
// lugar, se calcula la URL del API a partir del host con el que el usuario
// entró al frontend (window.location.hostname) — así el mismo build sirve
// para localhost, LAN y VPN sin recompilar.
//
// VITE_API_URL queda como override opcional, por si en el futuro el API se
// publica en otra ruta/puerto distinto del host del frontend (ej. detrás de
// un proxy reverso).

const API_PORT = import.meta.env.VITE_API_PORT || '3000';

function resolveApiUrl(): string {
  const override = import.meta.env.VITE_API_URL as string | undefined;
  if (override && override.trim() !== '') {
    return override.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location?.hostname) {
    return `${window.location.protocol}//${window.location.hostname}:${API_PORT}`;
  }
  return `http://localhost:${API_PORT}`;
}

export const API_URL = resolveApiUrl();
