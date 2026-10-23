import { eq, gte } from 'drizzle-orm';
import { useLiveQuery } from '@/db/use-live-query';
import { useState } from 'react';

import { db } from '@/db';
import { medicion, perfil, serie, sesion } from '@/db/schema';
import { ASISTIDAS, ESTANDARES } from '@/domain/estandares';
import { puntuaciones } from '@/domain/nivel';
import { pesoEnFecha } from '@/domain/progreso';

export { ESTANDARES };
export const SEMANAS_NIVEL = 8;

/** Series de trabajo de las últimas `semanas`, mediciones, sexo y puntuación de nivel por ejercicio. */
export function useNiveles(semanas = SEMANAS_NIVEL) {
  const [desde] = useState(() => new Date(Date.now() - semanas * 7 * 86_400_000).toISOString());
  const { data: series } = useLiveQuery(
    db
      .select({ ejercicioId: serie.ejercicioId, inicio: sesion.inicio, pesoKg: serie.pesoKg, reps: serie.reps, duracionS: serie.duracionS, calentamiento: serie.calentamiento })
      .from(serie)
      .innerJoin(sesion, eq(sesion.id, serie.sesionId))
      .where(gte(sesion.inicio, desde)), // también la sesión en curso,
    [desde],
  );
  const { data: mediciones } = useLiveQuery(db.select({ fecha: medicion.fecha, pesoKg: medicion.pesoKg }).from(medicion));
  const { data: perfiles } = useLiveQuery(db.select({ sexo: perfil.sexo }).from(perfil));
  const sexo = perfiles[0]?.sexo ?? null;
  const falta = !sexo ? 'sexo' : !mediciones.length ? 'peso' : null;
  const puntos = falta ? new Map<string, { marca: number; puntuacion: number }>() : puntuaciones(series.map((s) => (ASISTIDAS.has(s.ejercicioId) && s.pesoKg ? { ...s, pesoKg: -s.pesoKg } : s)), (f) => pesoEnFecha(mediciones, f), sexo!, ESTANDARES);
  return { series, puntos, falta, semanas };
}
