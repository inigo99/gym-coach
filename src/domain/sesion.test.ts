import { reloj, resumen, textoSerie, type SerieReg } from './sesion';

const s = (x: Partial<SerieReg>): SerieReg => ({ registro: 'carga', pesoKg: null, reps: null, duracionS: null, distanciaM: null, calentamiento: false, ...x });

test('reloj', () => {
  expect(reloj(65)).toBe('1:05');
  expect(reloj(750)).toBe('12:30');
  expect(reloj(3723)).toBe('1:02:03');
  expect(reloj(-5)).toBe('0:00');
});

test('textoSerie por tipo de registro', () => {
  expect(textoSerie(s({ pesoKg: 42.5, reps: 10 }))).toBe('42,5 kg × 10');
  expect(textoSerie(s({ registro: 'peso_corporal', reps: 8 }))).toBe('PC × 8');
  expect(textoSerie(s({ registro: 'peso_corporal', pesoKg: 10, reps: 6 }))).toBe('+10 kg × 6');
  expect(textoSerie(s({ registro: 'tiempo', duracionS: 90 }))).toBe('1:30');
  expect(textoSerie(s({ registro: 'cardio', duracionS: 1200, distanciaM: 3500 }))).toBe('20:00 · 3,5 km');
  expect(textoSerie(s({ registro: 'cardio', duracionS: 600 }))).toBe('10:00');
});

test('resumen: sin calentamiento y con peso corporal', () => {
  const r = resumen(
    [
      s({ pesoKg: 20, reps: 10, calentamiento: true }),
      s({ pesoKg: 60, reps: 8 }),
      s({ registro: 'peso_corporal', pesoKg: 5, reps: 5 }),
      s({ registro: 'cardio', duracionS: 600 }),
    ],
    75,
  );
  expect(r).toEqual({ series: 3, volumenKg: 480 + 400 });
});
