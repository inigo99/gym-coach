import { and, asc, eq, max } from 'drizzle-orm';

import { db } from '.';
import { ejercicio, horario, rutina, rutinaEjercicio } from './schema';

export function crearRutina(nombre: string) {
  return db.insert(rutina).values({ nombre }).returning({ id: rutina.id }).get().id;
}

export function renombrarRutina(id: number, nombre: string) {
  db.update(rutina).set({ nombre }).where(eq(rutina.id, id)).run();
}

export function borrarRutina(id: number) {
  db.delete(rutina).where(eq(rutina.id, id)).run(); // ejercicios y horario en cascada; sesiones pasan a rutina null
}

/** Crea una rutina ya con sus ejercicios y objetivos (rutina sugerida). Devuelve su id. */
export function guardarRutinaCompleta(nombre: string, filas: Omit<typeof rutinaEjercicio.$inferInsert, 'rutinaId' | 'orden'>[]) {
  return db.transaction((tx) => {
    const { id } = tx.insert(rutina).values({ nombre }).returning({ id: rutina.id }).get();
    filas.forEach((f, orden) => tx.insert(rutinaEjercicio).values({ ...f, rutinaId: id, orden }).run());
    return id;
  });
}

/** Añade al final con un objetivo por defecto según el tipo de ejercicio. */
export function anadirARutina(rutinaId: number, ejercicioId: string) {
  const { registro } = db.select({ registro: ejercicio.registro }).from(ejercicio).where(eq(ejercicio.id, ejercicioId)).get()!;
  const { orden } = db.select({ orden: max(rutinaEjercicio.orden) }).from(rutinaEjercicio).where(eq(rutinaEjercicio.rutinaId, rutinaId)).get()!;
  const conReps = registro === 'carga' || registro === 'peso_corporal';
  db.insert(rutinaEjercicio)
    .values({ rutinaId, ejercicioId, orden: (orden ?? -1) + 1, series: registro === 'cardio' ? 1 : 3, repsMin: conReps ? 8 : null, repsMax: conReps ? 12 : null })
    .onConflictDoNothing()
    .run();
}

const de = (rutinaId: number, ejercicioId: string) => and(eq(rutinaEjercicio.rutinaId, rutinaId), eq(rutinaEjercicio.ejercicioId, ejercicioId));

export function actualizarObjetivo(rutinaId: number, ejercicioId: string, campos: Partial<Pick<typeof rutinaEjercicio.$inferInsert, 'series' | 'repsMin' | 'repsMax' | 'descansoS'>>) {
  db.update(rutinaEjercicio).set(campos).where(de(rutinaId, ejercicioId)).run();
}

export function quitarDeRutina(rutinaId: number, ejercicioId: string) {
  db.delete(rutinaEjercicio).where(de(rutinaId, ejercicioId)).run();
}

/** Intercambia el ejercicio con el de arriba (-1) o el de abajo (+1). */
export function mover(rutinaId: number, ejercicioId: string, paso: -1 | 1) {
  db.transaction((tx) => {
    const lista = tx.select().from(rutinaEjercicio).where(eq(rutinaEjercicio.rutinaId, rutinaId)).orderBy(asc(rutinaEjercicio.orden)).all();
    const i = lista.findIndex((e) => e.ejercicioId === ejercicioId);
    const otro = lista[i + paso];
    if (i < 0 || !otro) return;
    tx.update(rutinaEjercicio).set({ orden: otro.orden }).where(de(rutinaId, ejercicioId)).run();
    tx.update(rutinaEjercicio).set({ orden: lista[i].orden }).where(de(rutinaId, otro.ejercicioId)).run();
  });
}

export function guardarHorario(fila: typeof horario.$inferInsert) {
  db.insert(horario).values(fila).onConflictDoUpdate({ target: horario.dia, set: fila }).run();
}

export function quitarHorario(dia: number) {
  db.delete(horario).where(eq(horario.dia, dia)).run();
}
