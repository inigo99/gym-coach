import { alCambiar } from './cambios';
import { useEffect, useState } from 'react';

/**
 * Como `useLiveQuery` de drizzle, pero recarga ante un cambio en CUALQUIER tabla.
 * El de drizzle solo mira la tabla del `from()`, así que las consultas con join
 * (series de sesiones terminadas) no se enteraban al cerrar la sesión.
 */
// ponytail: recarga todas las consultas montadas en cada escritura; filtrar por tablas del join si llega a ir lento
export function useLiveQuery<T>(query: PromiseLike<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T>([] as T);
  useEffect(() => {
    let vivo = true;
    const cargar = () => query.then((d) => vivo && setData(d), console.error);
    cargar();
    const l = alCambiar(cargar);
    return () => {
      vivo = false;
      l.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { data };
}
