import { useEffect, useState } from 'react';

// true por debajo del breakpoint `md` de Tailwind (768px). Para los casos
// que no se resuelven solo con CSS (ej. colSpan de una fila de totales).
const QUERY = '(max-width: 767px)';

export function useEsMovil() {
  const [esMovil, setEsMovil] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const onChange = () => setEsMovil(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return esMovil;
}
