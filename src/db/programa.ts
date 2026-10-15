import { eq, isNull } from 'drizzle-orm';

import { db } from '.';
import { horario, programa, programaRutina, rutina, rutinaEjercicio } from './schema';
import type { ConfigPrograma, DiaPrograma } from '@/domain/programa';
import { OBJETIVOS_PROGRAMA } from '@/domain/programa';

/**
 * Empieza un programa: termina el activo, crea sus rutinas y sustituye el horario semanal
 * (conserva la hora de aviso de los días que ya la tenían; si no, 18:00). Devuelve su id.
 */
export function empezarPrograma(c: ConfigPrograma, dias: DiaPrograma[], inicio: string, hoy: string) {
  return db.transaction((tx) => {
    tx.update(programa).set({ fin: hoy }).where(isNull(programa.fin)).run();
    const { id } = tx.insert(programa).values({ ...c, inicio }).returning({ id: programa.id }).get();
    const horas = new Map(tx.select().from(horario).all().map((h) => [h.dia, h]));
    tx.delete(horario).run();
    const prefijo = OBJETIVOS_PROGRAMA.find((o) => o.id === c.objetivo)!.nombre;
    for (const d of dias) {
      const r = tx.insert(rutina).values({ nombre: `${prefijo} · ${d.nombre}` }).returning({ id: rutina.id }).get().id;
      d.ejercicios.forEach(({ ejercicio, ...obj }, orden) => tx.insert(rutinaEjercicio).values({ rutinaId: r, ejercicioId: ejercicio.id, orden, ...obj }).run());
      tx.insert(programaRutina).values({ programaId: id, rutinaId: r, dia: d.dia }).run();
      const h = horas.get(d.dia);
      tx.insert(horario).values({ dia: d.dia, rutinaId: r, hora: h?.hora ?? 18, minuto: h?.minuto ?? 0 }).run();
    }
    return id;
  });
}

/** Termina el programa antes de tiempo. Las rutinas y el horario se quedan. */
export function terminarPrograma(id: number, hoy: string) {
  db.update(programa).set({ fin: hoy }).where(eq(programa.id, id)).run();
}
