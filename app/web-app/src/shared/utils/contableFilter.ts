import { API_URL } from '../config/api';

// Consulta el estado "contable" vigente de los repuestos al momento de
// exportar y devuelve un predicado para filtrar líneas de detalle. Un
// repuesto sin el campo (o una línea sin repuestoId) cuenta como contable.
export async function cargarFiltroContable(): Promise<
  (repuestoId?: number | null) => boolean
> {
  const res = await fetch(`${API_URL}/repuestos`);
  if (!res.ok) throw new Error(`Error ${res.status} al cargar repuestos`);
  const list: { id: number; contable?: boolean }[] = await res.json();
  const noContables = new Set(
    (Array.isArray(list) ? list : [])
      .filter((r) => r.contable === false)
      .map((r) => r.id),
  );
  return (repuestoId) => repuestoId == null || !noContables.has(repuestoId);
}
