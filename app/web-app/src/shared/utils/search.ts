// Búsqueda en listas de gestión: sin distinguir mayúsculas ni tildes, todas
// las palabras deben aparecer en algún campo. Si la búsqueda es un número
// (ej. "12", "#12", "OT12") el registro con ese ID exacto va primero.

type Campo = string | number | null | undefined;

export const normalizarTexto = (s: Campo) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

export function filtrarPorTexto<T extends { id: number }>(
  items: T[],
  busqueda: string,
  campos: (item: T) => Campo[],
): T[] {
  const q = normalizarTexto(busqueda);
  if (!q) return items;

  const idBuscado = /^(#|ot\s*)?(\d+)$/.exec(q)?.[2];
  const palabras = q.split(/\s+/);

  const coincidencias = items.filter((item) => {
    if (idBuscado && String(item.id) === idBuscado) return true;
    const texto = [item.id, ...campos(item)].map(normalizarTexto).join(' ');
    return palabras.every((p) => texto.includes(p));
  });

  if (!idBuscado) return coincidencias;
  return [
    ...coincidencias.filter((i) => String(i.id) === idBuscado),
    ...coincidencias.filter((i) => String(i.id) !== idBuscado),
  ];
}
