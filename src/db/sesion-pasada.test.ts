/* eslint-disable @typescript-eslint/no-require-imports -- jest.mock necesita require */
import { and, asc, eq, isNotNull } from 'drizzle-orm';

import { crearRutina, anadirARutina } from './rutina';
import { serie, sesion, sesionEjercicio } from './schema';
import { sembrarCatalogo } from './semilla';
import { anadirSerie, crearSesionPasada, descartarSiVacia, empezarSesion, seriesUltimaVez, terminarSesion } from './sesion';
import { claveDia } from '@/domain/calendario';
import { serieTemporal } from '@/domain/progreso';

jest.mock('./index', () => require('./bd-prueba'));
const { db } = jest.requireMock('./index');

beforeAll(() => sembrarCatalogo());

const PRESS = 'cat:barbell_bench_press_-_medium_grip';

test('un entrenamiento apuntado a mano cuenta como sesión terminada de ese día y sale en las gráficas', () => {
  const r = crearRutina('Torso');
  anadirARutina(r, PRESS);
  const id = crearSesionPasada('2026-09-01', r);
  const s = db.select().from(sesion).where(eq(sesion.id, id)).get();
  expect(claveDia(new Date(s.inicio))).toBe('2026-09-01');
  expect(s.fin).not.toBeNull();
  expect(db.select().from(sesionEjercicio).where(eq(sesionEjercicio.sesionId, id)).all().map((e: { ejercicioId: string }) => e.ejercicioId)).toEqual([PRESS]);

  anadirSerie({ sesionId: id, ejercicioId: PRESS, pesoKg: 70, reps: 5 });
  // La misma consulta que la ficha del ejercicio y las gráficas de progreso.
  const filas = db
    .select({ s: serie, inicio: sesion.inicio })
    .from(serie)
    .innerJoin(sesion, eq(sesion.id, serie.sesionId))
    .where(and(eq(serie.ejercicioId, PRESS), isNotNull(sesion.fin)))
    .orderBy(asc(sesion.inicio))
    .all();
  const puntos = serieTemporal('carga', 'e1rm', filas.map((f: { s: object; inicio: string }) => ({ ...f.s, inicio: f.inicio })));
  expect(puntos).toHaveLength(1);
  expect(puntos[0].valor).toBeGreaterThan(70);
});

test('"la última vez" va por fecha, aunque la sesión de un día pasado se apunte después', () => {
  const hoy = empezarSesion();
  anadirSerie({ sesionId: hoy, ejercicioId: PRESS, pesoKg: 80, reps: 5 });
  terminarSesion(hoy);
  const antigua = crearSesionPasada('2026-08-01');
  anadirSerie({ sesionId: antigua, ejercicioId: PRESS, pesoKg: 50, reps: 8 });
  // Desde la de hoy, la anterior es la del 1 de septiembre (70 kg), no la apuntada después (agosto).
  expect(seriesUltimaVez(PRESS, hoy).map((x) => x.pesoKg)).toEqual([70]);
  // Desde la de agosto no hay nada anterior.
  expect(seriesUltimaVez(PRESS, antigua)).toEqual([]);
});

test('una sesión apuntada a mano que se queda sin series se descarta', () => {
  const id = crearSesionPasada('2026-07-10');
  descartarSiVacia(id);
  expect(db.select().from(sesion).where(eq(sesion.id, id)).get()).toBeUndefined();
});
