import { and, eq, gte, isNotNull } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useState } from 'react';

import niveles from '@/assets/data/niveles.json';
import { db } from '@/db';
import { medicion, perfil, serie, sesion } from '@/db/schema';
import { puntuaciones, type Estandar } from '@/domain/nivel';
import { pesoEnFecha } from '@/domain/progreso';

export const ESTANDARES = niveles.ejercicios as Record<string, Estandar & { url: string }>;
export const SEMANAS_NIVEL = 8;

/** Series de trabajo de las últimas `semanas`, mediciones, sexo y puntuación de nivel por ejercicio. */
export function useNiveles(semanas = SEMANAS_NIVEL) {
  const [desde] = useState(() => new Date(Date.now() - semanas * 7 * 86_400_000).toISOString());
  const { data: series } = useLiveQuery(
    db
      .select({ ejercicioId: serie.ejercicioId, inicio: sesion.inicio, pesoKg: serie.pesoKg, reps: serie.reps, calentamiento: serie.calentamiento })
      .from(serie)
      .innerJoin(sesion, eq(sesion.id, serie.sesionId))
      .where(and(isNotNull(sesion.fin), gte(sesion.inicio, desde))),
    [desde],
  );
  const { data: mediciones } = useLiveQuery(db.select({ fecha: medicion.fecha, pesoKg: medicion.pesoKg }).from(medicion));
  const { data: perfiles } = useLiveQuery(db.select({ sexo: perfil.sexo }).from(perfil));
  const sexo = perfiles[0]?.sexo ?? null;
  const falta = !sexo ? 'sexo' : !mediciones.length ? 'peso' : null;
  const puntos = falta ? new Map<string, { marca: number; puntuacion: number }>() : puntuaciones(series, (f) => pesoEnFecha(mediciones, f), sexo!, ESTANDARES);
  return { series, puntos, falta, semanas };
}
