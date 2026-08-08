// Cálculo de tiempo trabajado y costo de mano de obra a partir de los
// detalles de informe diario (horaInicio / horaFinalización son datetimes
// completos, ej. "2026-08-08T14:30") y la tarifa del usuario (hora$ o minutos$).

export interface UsuarioTarifa {
  id: number;
  hora$?: number | null;
  minutos$?: number | null;
}

/**
 * Minutos trabajados entre dos datetimes completos. Soporta también el
 * formato heredado "HH:MM"/"HH:MM:SS" por si quedan registros antiguos.
 */
export function minutosTrabajados(
  inicio?: string | null,
  fin?: string | null,
): number {
  if (!inicio || !fin) return 0;

  if (inicio.includes('T') || inicio.includes('-')) {
    const ini = new Date(inicio).getTime();
    const term = new Date(fin).getTime();
    if (!isNaN(ini) && !isNaN(term)) {
      const diff = (term - ini) / 60000;
      return diff > 0 ? diff : 0;
    }
  }

  const toMinutes = (t: string) => {
    const [h, m, s] = t.split(':').map(Number);
    return (h || 0) * 60 + (m || 0) + (s || 0) / 60;
  };
  const diff = toMinutes(fin) - toMinutes(inicio);
  return diff > 0 ? diff : 0;
}

export function horasTrabajadas(
  inicio?: string | null,
  fin?: string | null,
): number {
  return minutosTrabajados(inicio, fin) / 60;
}

/**
 * Costo de mano de obra para un tramo trabajado, según la tarifa del
 * usuario: si cobra por minuto (minutos$) se usa esa tarifa; si cobra por
 * hora (hora$) se prorratea el tiempo exacto trabajado. Solo uno de los
 * dos campos debe estar cargado por usuario.
 */
export function costoManoObra(
  usuario: UsuarioTarifa | undefined,
  minutos: number,
): number {
  if (!usuario || minutos <= 0) return 0;
  const tarifaMinuto = Number(usuario.minutos$) || 0;
  const tarifaHora = Number(usuario.hora$) || 0;
  if (tarifaMinuto > 0) return minutos * tarifaMinuto;
  if (tarifaHora > 0) return (minutos / 60) * tarifaHora;
  return 0;
}
