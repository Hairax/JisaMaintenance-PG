// Host de un microservicio para los clientes TCP del gateway. Se fuerza IPv4:
// en Windows con Node ≥17 'localhost' se resuelve primero a ::1 y el gateway
// y el microservicio podían quedar en familias distintas (IPv4 vs IPv6), con
// el login colgado en "Pending". 'localhost' en el .env también se traduce.
export function serviceHost(host?: string): string {
  if (!host || host.trim().toLowerCase() === 'localhost') return '127.0.0.1';
  return host.trim();
}
