/* eslint-disable @typescript-eslint/no-require-imports -- jest.mock necesita require */
import { asc, eq, isNull } from 'drizzle-orm';

import { EJERCICIOS } from '@/catalogo';
import { generarPrograma, type ConfigPrograma } from '@/domain/programa';
import { empezarPrograma, terminarPrograma } from './programa';
import { guardarHorario, crearRutina } from './rutina';
import { horario, programa, programaRutina, rutina, rutinaEjercicio } from './schema';
import { sembrarCatalogo } from './semilla';

jest.mock('./index', () => require('./bd-prueba'));
const { db } = jest.requireMock('./index');

beforeAll(() => sembrarCatalogo());

const c: ConfigPrograma = { objetivo: 'perder_peso', dias: 3, semanas: 8, nivel: 'intermedio', material: 'gimnasio', minutos: 60 };

test('empezar un programa crea sus rutinas y sustituye el horario conservando la hora', () => {
  const vieja = crearRutina('Mi rutina');
  guardarHorario({ dia: 1, rutinaId: vieja, hora: 7, minuto: 30 });
  guardarHorario({ dia: 2, rutinaId: vieja, hora: 19, minuto: 0 });

  const dias = generarPrograma(c, EJERCICIOS);
  const id = empezarPrograma(c, dias, '2026-10-12', '2026-10-15');

  const h = db.select().from(horario).orderBy(asc(horario.dia)).all();
  expect(h.map((x: { dia: number }) => x.dia)).toEqual([1, 3, 5]);
  expect([h[0].hora, h[0].minuto, h[1].hora]).toEqual([7, 30, 18]);
  const rs = db.select({ id: rutina.id, nombre: rutina.nombre }).from(programaRutina).innerJoin(rutina, eq(rutina.id, programaRutina.rutinaId)).where(eq(programaRutina.programaId, id)).all();
  expect(rs.map((r: { nombre: string }) => r.nombre)).toEqual(['Perder peso · Cuerpo completo A', 'Perder peso · Cuerpo completo B', 'Perder peso · Cuerpo completo C']);
  const n = db.select().from(rutinaEjercicio).where(eq(rutinaEjercicio.rutinaId, rs[0].id)).all().length;
  expect(n).toBe(dias[0].ejercicios.length);

  // Uno nuevo termina el anterior; solo queda uno activo.
  const otro = empezarPrograma({ ...c, objetivo: 'musculo' }, generarPrograma({ ...c, objetivo: 'musculo' }, EJERCICIOS), '2026-10-19', '2026-10-19');
  const activos = db.select().from(programa).where(isNull(programa.fin)).all();
  expect(activos.map((p: { id: number }) => p.id)).toEqual([otro]);

  terminarPrograma(otro, '2026-10-20');
  expect(db.select().from(programa).where(isNull(programa.fin)).all()).toEqual([]);
  expect(db.select().from(horario).all().length).toBe(3); // el horario se queda
});
