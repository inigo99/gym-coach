import { EJERCICIOS } from '@/catalogo';

import { ESTANDARES } from './estandares';

test('todos los ejercicios menos el cardio tienen estándar de nivel', () => {
  expect(EJERCICIOS.filter((e) => !ESTANDARES[e.id] && e.registro !== 'cardio')).toEqual([]);
  const press = EJERCICIOS.find((e) => e.familia.id === 'press_pecho' && e.equipo[0] === 'maquina')!;
  expect(ESTANDARES[press.id].ref).toBe('cat:barbell_bench_press_-_medium_grip');
  expect(ESTANDARES['cat:assisted_pullup_machine']).toMatchObject({ tipo: 'reps', ref: 'cat:pullups' });
});
