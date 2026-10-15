import { like } from 'drizzle-orm';
import type { SQLiteTable } from 'drizzle-orm/sqlite-core';

import { db } from '.';
import * as t from './schema';

export const FORMATO = 2; // 2: añade programas; las copias de formato 1 se leen con programas vacíos

// Orden de inserción (padres antes que hijos); se borra al revés.
const TABLAS = {
  perfil: t.perfil,
  medicion: t.medicion,
  ejercicio: t.ejercicio, // solo los del usuario ('user:'); el catálogo se siembra solo
  rutina: t.rutina,
  rutina_ejercicio: t.rutinaEjercicio,
  horario: t.horario,
  sesion: t.sesion,
  sesion_ejercicio: t.sesionEjercicio,
  serie: t.serie,
  programa: t.programa,
  programa_rutina: t.programaRutina,
} as const;
type Nombre = keyof typeof TABLAS;

export type Copia = { app: 'gym-coach'; formato: number; exportado: string; tablas: Record<Nombre, Record<string, unknown>[]> };

export function exportar(): Copia {
  const tablas = Object.fromEntries(
    Object.entries(TABLAS).map(([n, tabla]) => [n, n === 'ejercicio' ? db.select().from(t.ejercicio).where(like(t.ejercicio.id, 'user:%')).all() : db.select().from(tabla as SQLiteTable).all()]),
  ) as Copia['tablas'];
  return { app: 'gym-coach', formato: FORMATO, exportado: new Date().toISOString(), tablas };
}

/** Comprueba la forma del fichero; los tipos y referencias los valida SQLite al insertar. */
export function leerCopia(texto: string): Copia {
  let c: unknown;
  try {
    c = JSON.parse(texto);
  } catch {
    throw new Error('El fichero no es un JSON válido.');
  }
  const o = c as Partial<Copia>;
  if (o?.app !== 'gym-coach' || typeof o.tablas !== 'object' || !o.tablas) throw new Error('No es una copia de gym-coach.');
  if (o.formato !== FORMATO && o.formato !== 1) throw new Error(`Formato de copia no compatible (${o.formato}).`);
  if (o.formato === 1) Object.assign(o.tablas, { programa: [], programa_rutina: [] });
  for (const n of Object.keys(TABLAS) as Nombre[]) {
    const filas = o.tablas[n];
    if (!Array.isArray(filas) || filas.some((f) => typeof f !== 'object' || f === null || Array.isArray(f))) throw new Error(`Tabla «${n}» mal formada.`);
  }
  if (o.tablas.ejercicio.some((e) => typeof e.id !== 'string' || !e.id.startsWith('user:'))) throw new Error('La copia trae ejercicios que no son del usuario.');
  return o as Copia;
}

/** Sustituye todos los datos del usuario por los de la copia. Todo o nada. */
export function importar(c: Copia) {
  const nombres = Object.keys(TABLAS) as Nombre[];
  db.transaction((tx) => {
    for (const n of [...nombres].reverse()) {
      if (n === 'ejercicio') tx.delete(t.ejercicio).where(like(t.ejercicio.id, 'user:%')).run();
      else tx.delete(TABLAS[n] as SQLiteTable).run();
    }
    for (const n of nombres) {
      const filas = c.tablas[n];
      for (let i = 0; i < filas.length; i += 200) tx.insert(TABLAS[n] as SQLiteTable).values(filas.slice(i, i + 200) as never).run();
    }
  });
}
