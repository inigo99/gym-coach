import { and, asc, desc, eq, lt, max, ne } from 'drizzle-orm';

import { db } from '.';
import { rutinaEjercicio, serie, sesion, sesionEjercicio } from './schema';

/** Empieza una sesión libre, una copia de otra (mismos ejercicios y orden) o la de una rutina. */
export function empezarSesion(desde?: { sesion: number } | { rutina: number }) {
  return db.transaction((tx) => {
    const rutinaId =
      desde && 'sesion' in desde ? (tx.select({ r: sesion.rutinaId }).from(sesion).where(eq(sesion.id, desde.sesion)).get()?.r ?? null) : (desde?.rutina ?? null);
    const { id } = tx.insert(sesion).values({ inicio: new Date().toISOString(), rutinaId }).returning({ id: sesion.id }).get();
    const ejercicios = !desde
      ? []
      : 'sesion' in desde
        ? tx.select({ ejercicioId: sesionEjercicio.ejercicioId, orden: sesionEjercicio.orden }).from(sesionEjercicio).where(eq(sesionEjercicio.sesionId, desde.sesion)).all()
        : tx.select({ ejercicioId: rutinaEjercicio.ejercicioId, orden: rutinaEjercicio.orden }).from(rutinaEjercicio).where(eq(rutinaEjercicio.rutinaId, desde.rutina)).all();
    if (ejercicios.length) tx.insert(sesionEjercicio).values(ejercicios.map((e) => ({ ...e, sesionId: id }))).run();
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

/** Series del ejercicio en la sesión más reciente ANTERIOR (por fecha) a `actual` en la que se hizo. Por fecha y no por id: las sesiones apuntadas a mano pueden ser de días pasados. */
export function seriesUltimaVez(ejercicioId: string, actual: number) {
  const ref = db.select({ inicio: sesion.inicio }).from(sesion).where(eq(sesion.id, actual)).get();
  const ultima = db
    .select({ id: serie.sesionId })
    .from(serie)
    .innerJoin(sesion, eq(sesion.id, serie.sesionId))
    .where(and(eq(serie.ejercicioId, ejercicioId), ne(serie.sesionId, actual), lt(sesion.inicio, ref?.inicio ?? '9999')))
    .orderBy(desc(sesion.inicio))
    .limit(1)
    .get();
  if (!ultima) return [];
  return db.select().from(serie).where(and(eq(serie.sesionId, ultima.id), eq(serie.ejercicioId, ejercicioId))).orderBy(asc(serie.id)).all();
}

/**
 * Entrenamiento apuntado a mano en un día (AAAA-MM-DD, hoy o pasado): se guarda ya terminado,
 * a las 18:00 de ese día (o una hora antes de ahora si es hoy), así cuenta en gráficas, récords y niveles.
 * Con `rutinaId`, lleva ya sus ejercicios. Devuelve su id.
 */
export function crearSesionPasada(fecha: string, rutinaId?: number, ahora = new Date()) {
  const [a, m, d] = fecha.split('-').map(Number);
  const inicio = new Date(Math.min(new Date(a, m - 1, d, 18).getTime(), ahora.getTime() - 3_600_000));
  const fin = new Date(inicio.getTime() + 3_600_000);
  return db.transaction((tx) => {
    const { id } = tx.insert(sesion).values({ inicio: inicio.toISOString(), fin: fin.toISOString(), rutinaId: rutinaId ?? null }).returning({ id: sesion.id }).get();
    if (rutinaId) {
      const ejercicios = tx.select({ ejercicioId: rutinaEjercicio.ejercicioId, orden: rutinaEjercicio.orden }).from(rutinaEjercicio).where(eq(rutinaEjercicio.rutinaId, rutinaId)).all();
      if (ejercicios.length) tx.insert(sesionEjercicio).values(ejercicios.map((e) => ({ ...e, sesionId: id }))).run();
    }
    return id;
  });
}

/** Al salir de editar una sesión pasada: si se quedó sin series, se borra. */
export function descartarSiVacia(id: number) {
  const hay = db.select({ id: serie.id }).from(serie).where(eq(serie.sesionId, id)).limit(1).get();
  if (!hay) borrarSesion(id);
}
