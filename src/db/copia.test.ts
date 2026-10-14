/* eslint-disable @typescript-eslint/no-require-imports -- jest.mock necesita require */
import { exportar, importar, leerCopia } from './copia';
import { anadirARutina, crearRutina, guardarHorario } from './rutina';
import { medicion, perfil, serie, sesion } from './schema';
import { sembrarCatalogo } from './semilla';
import { anadirEjercicio, anadirSerie, empezarSesion, terminarSesion } from './sesion';

jest.mock('./index', () => require('./bd-prueba'));
const { db } = jest.requireMock('./index');

beforeAll(() => sembrarCatalogo());

const PRESS = 'cat:barbell_bench_press_-_medium_grip';

test('exportar → importar devuelve los mismos datos', () => {
  db.insert(perfil).values({ id: 1, nombre: 'Íñigo', sexo: 'h', alturaCm: 180, nacimiento: '1999-05-01' }).run();
  db.insert(medicion).values({ fecha: '2026-10-01', pesoKg: 78.5 }).run();
  const r = crearRutina('Torso');
  anadirARutina(r, PRESS);
  guardarHorario({ dia: 2, rutinaId: r, hora: 18, minuto: 30 });
  const s = empezarSesion({ rutina: r });
  anadirSerie({ sesionId: s, ejercicioId: PRESS, pesoKg: 60, reps: 8 });
  anadirSerie({ sesionId: s, ejercicioId: PRESS, pesoKg: 20, reps: 10, calentamiento: true });
  terminarSesion(s);

  const copia = exportar();
  const texto = JSON.stringify(copia);

  // Datos distintos antes de importar: se sustituyen por completo
  const otra = empezarSesion();
  anadirEjercicio(otra, PRESS);
  anadirSerie({ sesionId: otra, ejercicioId: PRESS, pesoKg: 99, reps: 1 });

  importar(leerCopia(texto));
  expect(exportar().tablas).toEqual(copia.tablas);
  expect(db.select().from(sesion).all()).toHaveLength(1);
  expect(db.select().from(serie).all().map((x: { calentamiento: boolean }) => x.calentamiento)).toEqual([false, true]);
});

test('una copia con referencias rotas no cambia nada', () => {
  const antes = exportar().tablas;
  const mala = exportar();
  mala.tablas.serie = [{ id: 999, sesionId: 12345, ejercicioId: PRESS, pesoKg: 1, reps: 1, calentamiento: false }];
  expect(() => importar(leerCopia(JSON.stringify(mala)))).toThrow();
  expect(exportar().tablas).toEqual(antes);
});

test('leerCopia rechaza ficheros que no son copias', () => {
  expect(() => leerCopia('no json')).toThrow('JSON');
  expect(() => leerCopia('{"app":"otra"}')).toThrow('gym-coach');
  expect(() => leerCopia(JSON.stringify({ ...exportar(), formato: 99 }))).toThrow('Formato');
  const sinTabla = exportar() as unknown as { tablas: Record<string, unknown> };
  sinTabla.tablas.serie = 'x';
  expect(() => leerCopia(JSON.stringify(sinTabla))).toThrow('serie');
  const conCatalogo = exportar();
  conCatalogo.tablas.ejercicio = [{ id: PRESS }];
  expect(() => leerCopia(JSON.stringify(conCatalogo))).toThrow('usuario');
});
