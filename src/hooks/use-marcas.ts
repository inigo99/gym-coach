import { eq, isNotNull } from 'drizzle-orm';
import { useMemo } from 'react';

import { db } from '@/db';
import { serie, sesion } from '@/db/schema';
import { useLiveQuery } from '@/db/use-live-query';
import { marcasPorEjercicio } from '@/domain/marcas';

/** Última vez y mejor serie de cada ejercicio (sesiones terminadas, también las apuntadas a mano). */
export function useMarcas() {
  const { data } = useLiveQuery(
    db
      .select({ ejercicioId: serie.ejercicioId, sesionId: serie.sesionId, inicio: sesion.inicio, pesoKg: serie.pesoKg, reps: serie.reps, duracionS: serie.duracionS, distanciaM: serie.distanciaM, calentamiento: serie.calentamiento })
      .from(serie)
      .innerJoin(sesion, eq(sesion.id, serie.sesionId))
      .where(isNotNull(sesion.fin)),
  );
  return useMemo(() => marcasPorEjercicio(data), [data]);
}
