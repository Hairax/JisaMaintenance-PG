// Códigos jerárquicos de activos: CC.PP.MM.SS (centro de costo, proceso,
// máquina, subunidad; cada nivel con su correlativo a 2 dígitos). Los usan
// las tablas para mostrarlos y los buscadores para filtrar por ellos.

const dos = (n: number) => String(n).padStart(2, '0');

interface ProcesoCod {
  id: number;
  centroCosto: number;
  correlativo?: number | null;
}
interface MaquinaCod {
  id: number;
  centroCosto_id?: number | null;
  proceso_id?: number | null;
  correlativo?: number | null;
}
interface MaquinaOpcionCod {
  id: number;
  centroCosto: number;
  proceso: number;
  correlativo?: number | null;
}

/** CC.PP — sin correlativo, solo el centro de costo. */
export const codigoProceso = (p: Omit<ProcesoCod, 'id'>) =>
  p.correlativo ? `${p.centroCosto}.${dos(p.correlativo)}` : `${p.centroCosto}`;

/** CC.PP.MM, o undefined si falta algún correlativo. */
export function codigoMaquina(m: MaquinaCod, procesos: ProcesoCod[]) {
  if (!m.centroCosto_id || !m.proceso_id || !m.correlativo) return undefined;
  const pc = procesos.find((p) => p.id === m.proceso_id)?.correlativo;
  if (pc === undefined || pc === null) return undefined;
  return `${m.centroCosto_id}.${dos(pc)}.${dos(m.correlativo)}`;
}

/** CC.PP.MM.SS, o undefined si falta algún correlativo. */
export function codigoSubUnidad(
  s: { maquina_id: number; correlativo?: number | null },
  maquinas: MaquinaOpcionCod[],
  procesos: ProcesoCod[],
) {
  const m = maquinas.find((x) => x.id === s.maquina_id);
  const p = procesos.find((x) => x.id === m?.proceso);
  if (
    !m ||
    !p ||
    s.correlativo == null ||
    p.correlativo == null ||
    m.correlativo == null
  )
    return undefined;
  return `${m.centroCosto}.${dos(p.correlativo)}.${dos(m.correlativo)}.${dos(s.correlativo)}`;
}
