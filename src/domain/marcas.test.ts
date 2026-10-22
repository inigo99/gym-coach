import { marcasPorEjercicio, type SerieMarca } from './marcas';

const s = (o: Partial<SerieMarca>): SerieMarca => ({ ejercicioId: 'press', sesionId: 1, inicio: '2026-10-01T18:00:00Z', pesoKg: null, reps: null, duracionS: null, distanciaM: null, calentamiento: false, ...o });

test('última vez = mejor serie de la sesión más reciente; mejor = más peso, y a igual peso más reps', () => {
  const m = marcasPorEjercicio([
    s({ sesionId: 1, pesoKg: 80, reps: 3 }),
    s({ sesionId: 1, pesoKg: 80, reps: 5 }),
    s({ sesionId: 2, inicio: '2026-10-08T18:00:00Z', pesoKg: 70, reps: 8 }),
    s({ sesionId: 2, inicio: '2026-10-08T18:00:00Z', pesoKg: 100, reps: 1, calentamiento: true }),
    s({ ejercicioId: 'plancha', duracionS: 60 }),
    s({ ejercicioId: 'plancha', sesionId: 3, inicio: '2026-09-01T18:00:00Z', duracionS: 90 }),
  ]);
  expect(m.get('press')!.ultima).toMatchObject({ pesoKg: 70, reps: 8 });
  expect(m.get('press')!.mejor).toMatchObject({ pesoKg: 80, reps: 5 });
  expect(m.get('plancha')!.ultima.duracionS).toBe(60);
  expect(m.get('plancha')!.mejor.duracionS).toBe(90);
});
