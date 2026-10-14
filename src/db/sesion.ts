import { and, asc, desc, eq, max, ne } from 'drizzle-orm';

import { db } from '.';
import { serie, sesion, sesionEjercicio } from './schema';

/** Empieza una sesión; con `copiarDe`, con los mismos ejercicios y en el mismo orden. */
export function empezarSesion(copiarDe?: number) {
  return db.transaction((tx) => {
    const { id } = tx.insert(sesion).values({ inicio: new Date().toISOString() }).returning({ id: sesion.id }).get();
    if (copiarDe) {
      const ejercicios = tx.select().from(sesionEjercicio).where(eq(sesionEjercicio.sesionId, copiarDe)).all();
      if (ejercicios.length) tx.insert(sesionEjercicio).values(ejercicios.map((e) => ({ ...e, sesionId: id }))).run();
    }
    return id;
  });
}

export function anadirEjercicio(sesionId: number, ejercicioId: string) {
  const { orden } = db.select({ orden: max(sesionEjercicio.orden) }).from(sesionEjercicio).where(eq(sesionEjercicio.sesionId, sesionId)).get()!;
  db.insert(sesionEjercicio)
    .values({ sesionId, ejercicioId, orden: (orden ?? -1) + 1 })
    .onConflictDoNothing()
    .run();
}

export function quitarEjercicio(sesionId: number, ejercicioId: string) {
  db.transaction((tx) => {
    tx.delete(serie).where(and(eq(serie.sesionId, sesionId), eq(serie.ejercicioId, ejercicioId))).run();
    tx.delete(sesionEjercicio).where(and(eq(sesionEjercicio.sesionId, sesionId), eq(sesionEjercicio.ejercicioId, ejercicioId))).run();
  });
}

export function anadirSerie(datos: typeof serie.$inferInsert) {
  db.insert(serie).values(datos).run();
}

export function borrarSerie(id: number) {
  db.delete(serie).where(eq(serie.id, id)).run();
}

/** Cierra la sesión. Si no tiene ninguna serie, la borra. */
export function terminarSesion(id: number) {
  const hay = db.select({ id: serie.id }).from(serie).where(eq(serie.sesionId, id)).limit(1).get();
  if (hay) db.update(sesion).set({ fin: new Date().toISOString() }).where(eq(sesion.id, id)).run();
  else borrarSesion(id);
}

export function borrarSesion(id: number) {
  db.delete(sesion).where(eq(sesion.id, id)).run(); // series y ejercicios en cascada
}

/** Series del ejercicio en la última sesión anterior a `actual` en la que se hizo. */
export function seriesUltimaVez(ejercicioId: string, actual: number) {
  const ultima = db
    .select({ id: serie.sesionId })
    .from(serie)
    .where(and(eq(serie.ejercicioId, ejercicioId), ne(serie.sesionId, actual)))
    .orderBy(desc(serie.sesionId))
    .limit(1)
    .get();
  if (!ultima) return [];
  return db.select().from(serie).where(and(eq(serie.sesionId, ultima.id), eq(serie.ejercicioId, ejercicioId))).orderBy(asc(serie.id)).all();
}
