import niveles from '../../assets/data/niveles.json';
import ejercicios from '../../assets/data/ejercicios.json';
import { marca, nivel, nivelPorGrupo, puntuacion, puntuaciones, seriesPorSemana } from './nivel';

const BANCA = [0.5, 1.0, 1.25, 1.5, 2.0];

test('puntuacion: tramos, extremos e interpolación', () => {
  expect(puntuacion(0.3, BANCA)).toBe(1);
  expect(puntuacion(0.75, BANCA)).toBeCloseTo(1.5);
  expect(puntuacion(1.0, BANCA)).toBe(2);
  expect(puntuacion(1.375, BANCA)).toBeCloseTo(3.5);
  expect(puntuacion(2.5, BANCA)).toBe(5);
  expect(puntuacion(0, [0, 7, 13, 21, 30])).toBe(1); // dominadas: principiante desde 0
});

test('nivel: nombre y avance', () => {
  expect(nivel(1)).toEqual({ indice: 0, nombre: 'Principiante', haciaSiguiente: 0 });
  expect(nivel(3.5)).toEqual({ indice: 2, nombre: 'Intermedio', haciaSiguiente: 0.5 });
  expect(nivel(5)).toEqual({ indice: 4, nombre: 'Élite', haciaSiguiente: null });
});

test('marca: ratio con 1RM y reps equivalentes con lastre', () => {
  // 80 kg × 5 → 1RM 93,3; peso corporal 80 → 1,17
  expect(marca('ratio', [{ pesoKg: 80, reps: 5, pesoCorporalKg: 80 }, { pesoKg: 60, reps: 10, pesoCorporalKg: 80 }])).toBeCloseTo(1.1667, 3);
  expect(marca('reps', [{ pesoKg: null, reps: 12, pesoCorporalKg: 80 }])).toBe(12);
  // +20 kg × 5 con 80 kg: 1RM 116,7 → 30 × (1,458 − 1) = 13,75 reps sin lastre
  expect(marca('reps', [{ pesoKg: 20, reps: 5, pesoCorporalKg: 80 }, { pesoKg: null, reps: 10, pesoCorporalKg: 80 }])).toBeCloseTo(13.75, 2);
  expect(marca('ratio', [{ pesoKg: 50, reps: 20, pesoCorporalKg: 80 }])).toBeNull(); // > 12 reps
});

test('nivelPorGrupo: ponderado y solo con ejercicio principal', () => {
  const g = nivelPorGrupo([
    { principales: ['pecho'], secundarios: ['hombros', 'triceps'], puntuacion: 3 },
    { principales: ['hombros'], secundarios: ['triceps'], puntuacion: 2 },
  ]);
  expect(g.get('pecho')).toBe(3);
  expect(g.get('hombros')).toBeCloseTo((3 * 0.5 + 2) / 1.5);
  expect(g.has('triceps')).toBe(false);
});

test('seriesPorSemana', () => {
  const v = seriesPorSemana([{ principales: ['pecho'], secundarios: ['triceps'] }, { principales: ['pecho'], secundarios: [] }], 2);
  expect(v.get('pecho')).toBe(1);
  expect(v.get('triceps')).toBe(0.25);
});

test('niveles.json: 5 umbrales crecientes por sexo y ejercicios del catálogo', () => {
  const ids = new Set(ejercicios.map((e) => e.id));
  for (const [id, n] of Object.entries(niveles.ejercicios)) {
    expect(ids).toContain(id);
    for (const u of [n.h, n.m]) {
      expect(u).toHaveLength(5);
      u.slice(1).forEach((x, i) => expect(x).toBeGreaterThanOrEqual(u[i]));
    }
  }
});

test('puntuaciones: mejor marca por ejercicio con su estándar', () => {
  const est = { 'cat:banca': { tipo: 'ratio' as const, h: BANCA, m: [0.3, 0.5, 0.75, 1.1, 1.45] }, 'cat:dominadas': { tipo: 'reps' as const, h: [0, 7, 13, 21, 30], m: [0, 0, 6, 12, 19] } };
  const p = puntuaciones(
    [
      { ejercicioId: 'cat:banca', inicio: '2026-10-01', pesoKg: 80, reps: 1, calentamiento: false }, // 1,0 → novato
      { ejercicioId: 'cat:banca', inicio: '2026-10-01', pesoKg: 100, reps: 1, calentamiento: true }, // calentamiento: no cuenta
      { ejercicioId: 'cat:dominadas', inicio: '2026-10-01', pesoKg: null, reps: 10, calentamiento: false },
      { ejercicioId: 'cat:sin_estandar', inicio: '2026-10-01', pesoKg: 50, reps: 5, calentamiento: false },
    ],
    () => 80,
    'h',
    est,
  );
  expect(p.get('cat:banca')).toEqual({ marca: 1, puntuacion: 2 });
  expect(p.get('cat:dominadas')?.puntuacion).toBeCloseTo(2.5);
  expect(p.has('cat:sin_estandar')).toBe(false);
});
