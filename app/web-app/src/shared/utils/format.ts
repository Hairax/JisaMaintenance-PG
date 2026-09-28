import type { BadgeTone } from '../components/management/Badge';

// Formatos compartidos por las tablas de gestión.
export const fmtFecha = (d?: string | Date | null) => {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/** Tono estándar para el estado de una OT. */
export const toneEstadoOt = (estado?: string): BadgeTone => {
  if (!estado) return 'neutral';
  if (estado === 'Cerrada') return 'success';
  if (estado === 'Abierta') return 'info';
  if (estado.startsWith('En Progreso')) return 'warning';
  return 'neutral';
};
