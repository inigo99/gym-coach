/* eslint-disable @typescript-eslint/no-require-imports -- jest.mock necesita require dentro de la fábrica */
// Prueba las migraciones y las funciones de sesión sobre SQLite real (better-sqlite3 en Node).
import { eq } from 'drizzle-orm';

import { serie, sesion, sesionEjercicio } from './schema';
import { sembrarCatalogo } from './semilla';
import { anadirEjercicio, anadirSerie, empezarSesion, quitarEjercicio, seriesUltimaVez, terminarSesion } from './sesion';

jest.mock('./index', () => {
  const Database = require('better-sqlite3');
  const { drizzle } = require('drizzle-orm/better-sqlite3');
  const { migrate } = require('drizzle-orm/better-sqlite3/migrator');
  const cliente = new Database(':memory:');
  cliente.pragma('foreign_keys = ON');
  const db = drizzle(cliente, { schema: require('./schema') });
  migrate(db, { migrationsFolder: 'drizzle' });
  return { db };
});
const { db } = jest.requireMock('./index');

beforeAll(() => sembrarCatalogo());

const PRESS = 'cat:barbell_bench_press_-_medium_grip';
const CURL = 'cat:barbell_curl';

test('sesión completa: ejercicios, series, última vez, repetir y terminar', () => {
  const s1 = empezarSesion();
  anadirEjercicio(s1, PRESS);
  anadirEjercicio(s1, CURL);
  anadirEjercicio(s1, PRESS); // repetido: se ignora
  anadirSerie({ sesionId: s1, ejercicioId: PRESS, pesoKg: 20, reps: 10, calentamiento: true });
  anadirSerie({ sesionId: s1, ejercicioId: PRESS, pesoKg: 60, reps: 8 });
  anadirSerie({ sesionId: s1, ejercicioId: CURL, pesoKg: 25, reps: 10 });
  terminarSesion(s1);

  const s2 = empezarSesion(s1);
  const orden = db.select().from(sesionEjercicio).where(eq(sesionEjercicio.sesionId, s2)).all();
  expect(orden.map((e: { ejercicioId: string; orden: number }) => [e.ejercicioId, e.orden])).toEqual([[PRESS, 0], [CURL, 1]]);
  expect(seriesUltimaVez(PRESS, s2).map((x) => x.pesoKg)).toEqual([20, 60]);
  expect(seriesUltimaVez(PRESS, s1)).toEqual([]);

  quitarEjercicio(s2, CURL);
  expect(db.select().from(sesionEjercicio).where(eq(sesionEjercicio.sesionId, s2)).all()).toHaveLength(1);

  terminarSesion(s2); // sin series: se borra
  expect(db.select().from(sesion).where(eq(sesion.id, s2)).get()).toBeUndefined();
  expect(db.select().from(sesion).where(eq(sesion.id, s1)).get().fin).not.toBeNull();
});

test('borrar una sesión borra sus series en cascada', () => {
  const s = empezarSesion();
  anadirEjercicio(s, CURL);
  anadirSerie({ sesionId: s, ejercicioId: CURL, pesoKg: 20, reps: 12 });
  db.delete(sesion).where(eq(sesion.id, s)).run();
  expect(db.select().from(serie).where(eq(serie.sesionId, s)).all()).toEqual([]);
});
