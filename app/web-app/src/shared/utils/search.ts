// Búsqueda en listas de gestión: sin distinguir mayúsculas ni tildes, todas
// las palabras deben aparecer en algún campo. Si la búsqueda es un número
// (ej. "12", "#12", "OT12") el registro con ese ID exacto va primero.
//
// Las vistas que identifican sus registros con un código jerárquico
// (1.01.01…) en vez del ID pasan `codigo`: entonces se busca por código y
// no por ID (ver coincideCodigo).

type Campo = string | number | null | undefined;

export const normalizarTexto = (s: Campo) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

/**
 * Coincidencia por código jerárquico, segmento a segmento: los segmentos
 * escritos completos deben ser iguales y el último puede estar a medias.
 * Así "1.01" encuentra 1.01, 1.01.01, 1.01.02… pero no 11.01 ni 2.1.01, y
 * "1." se queda solo con el centro de costo 1 (no 10, 11…).
 */
export function coincideCodigo(codigo: string, busqueda: string) {
  const c = codigo.split('.');
  // Con punto final ("1.") el último segmento escrito también está completo.
  const completo = busqueda.endsWith('.');
  const q = busqueda.replace(/\.$/, '').split('.');
  if (q.length > c.length) return false;
  return q.every((seg, i) =>
    i < q.length - 1 || completo
      ? Number(seg) === Number(c[i])
      : c[i].startsWith(seg),
  );
}

const pareceCodigo = (q: string) => /^\d+(\.\d*)*$/.test(q);

export function filtrarPorTexto<T extends { id: number }>(
  items: T[],
  busqueda: string,
  campos: (item: T) => Campo[],
  opciones: { codigo?: (item: T) => string | undefined } = {},
): T[] {
  const q = normalizarTexto(busqueda);
  if (!q) return items;

  const { codigo } = opciones;
  if (codigo) {
    if (pareceCodigo(q)) {
      // Búsqueda por código; el código exacto primero.
      const hits = items.filter((i) => {
        const c = codigo(i);
        return c !== undefined && coincideCodigo(c, q);
      });
      const exacto = q.replace(/\.$/, '');
      return [
        ...hits.filter((i) => codigo(i) === exacto),
        ...hits.filter((i) => codigo(i) !== exacto),
      ];
    }
    const palabras = q.split(/\s+/);
    return items.filter((item) => {
      const texto = [codigo(item), ...campos(item)]
        .map(normalizarTexto)
        .join(' ');
      return palabras.every((p) => texto.includes(p));
    });
  }

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
