/* eslint-disable @typescript-eslint/no-require-imports -- jest.mock necesita require */
import { asc, eq } from 'drizzle-orm';

import { anadirARutina, borrarRutina, crearRutina, guardarHorario, mover, quitarHorario } from './rutina';
import { horario, rutinaEjercicio, sesion, sesionEjercicio } from './schema';
import { sembrarCatalogo } from './semilla';
import { anadirSerie, empezarSesion, terminarSesion } from './sesion';

jest.mock('./index', () => require('./bd-prueba'));
const { db } = jest.requireMock('./index');

beforeAll(() => sembrarCatalogo());

const PRESS = 'cat:barbell_bench_press_-_medium_grip';
const CURL = 'cat:barbell_curl';
const CINTA = 'cat:running_treadmill';

const orden = (r: number) =>
  db.select().from(rutinaEjercicio).where(eq(rutinaEjercicio.rutinaId, r)).orderBy(asc(rutinaEjercicio.orden)).all().map((e: { ejercicioId: string }) => e.ejercicioId);

test('rutina: objetivos por defecto, orden y sesión desde rutina', () => {
  const r = crearRutina('Torso');
  [PRESS, CURL, CINTA].forEach((e) => anadirARutina(r, e));
  const [press, , cinta] = db.select().from(rutinaEjercicio).where(eq(rutinaEjercicio.rutinaId, r)).orderBy(asc(rutinaEjercicio.orden)).all();
  expect([press.series, press.repsMin, press.repsMax]).toEqual([3, 8, 12]);
  expect([cinta.series, cinta.repsMin]).toEqual([1, null]);

  mover(r, CINTA, -1);
  mover(r, PRESS, -1); // ya es el primero: no cambia
  expect(orden(r)).toEqual([PRESS, CINTA, CURL]);

  const s = empezarSesion({ rutina: r });
  expect(db.select().from(sesion).where(eq(sesion.id, s)).get().rutinaId).toBe(r);
  expect(db.select().from(sesionEjercicio).where(eq(sesionEjercicio.sesionId, s)).orderBy(asc(sesionEjercicio.orden)).all().map((e: { ejercicioId: string }) => e.ejercicioId)).toEqual([PRESS, CINTA, CURL]);

  // Repetir una sesión de rutina mantiene la rutina
  anadirSerie({ sesionId: s, ejercicioId: PRESS, pesoKg: 50, reps: 10 });
  terminarSesion(s);
  const s2 = empezarSesion({ sesion: s });
  expect(db.select().from(sesion).where(eq(sesion.id, s2)).get().rutinaId).toBe(r);

  // Borrar la rutina: horario fuera, sesiones conservadas sin rutina
  guardarHorario({ dia: 1, rutinaId: r, hora: 18, minuto: 30 });
  guardarHorario({ dia: 1, rutinaId: r, hora: 19, minuto: 0 }); // actualiza
  expect(db.select().from(horario).all()).toEqual([{ dia: 1, rutinaId: r, hora: 19, minuto: 0 }]);
  borrarRutina(r);
  expect(db.select().from(horario).all()).toEqual([]);
  expect(db.select().from(sesion).where(eq(sesion.id, s)).get().rutinaId).toBeNull();
  quitarHorario(1);
});
