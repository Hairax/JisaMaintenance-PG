// Los correlativos auto-asignados (máquina, proceso, subunidad) se calculan
// con un SELECT del máximo actual + INSERT, protegidos por un lock
// pessimistic_write dentro de una transacción (ver getNextCorrelativo en
// cada servicio) y respaldados por un índice único en la entidad. El lock
// cubre el caso común (ya existe al menos una fila en ese scope); el índice
// único es el respaldo para el caso borde de la primera fila de un scope,
// donde no hay nada que lockear. Si dos requests concurrentes chocan ahí,
// el INSERT de la segunda falla con ER_DUP_ENTRY — este helper reintenta
// una vez, ya con el correlativo recalculado, en vez de propagar el error
// al usuario.

export function isDuplicateEntryError(error: unknown): boolean {
  const code =
    (error as { code?: string })?.code ??
    (error as { driverError?: { code?: string } })?.driverError?.code;
  return code === 'ER_DUP_ENTRY';
}

export async function runWithDuplicateRetry<T>(
  operation: () => Promise<T>,
  maxAttempts = 2,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (!isDuplicateEntryError(error) || attempt === maxAttempts - 1) {
        throw error;
      }
      lastError = error;
    }
  }
  throw lastError;
}
