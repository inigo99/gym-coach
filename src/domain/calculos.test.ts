import { cargaSerie, e1rm, edad, imc, volumen } from './calculos';

test('e1rm: Epley y límites', () => {
  expect(e1rm(100, 1)).toBe(100);
  expect(e1rm(100, 10)).toBeCloseTo(133.33, 2);
  expect(e1rm(60, 12)).toBeCloseTo(84, 5);
  expect(e1rm(100, 13)).toBeNull();
  expect(e1rm(100, 0)).toBeNull();
  expect(e1rm(0, 5)).toBeNull();
  expect(e1rm(100, 2.5)).toBeNull();
});

test('cargaSerie: el peso corporal suma el lastre', () => {
  expect(cargaSerie('peso_corporal', 10, 75)).toBe(85);
  expect(cargaSerie('carga', 40, 75)).toBe(40);
});

test('volumen: ignora calentamiento', () => {
  expect(volumen([{ pesoKg: 20, reps: 10, calentamiento: true }, { pesoKg: 60, reps: 8 }, { pesoKg: 60, reps: 6 }])).toBe(840);
  expect(volumen([])).toBe(0);
});

test('edad: antes y después del cumpleaños', () => {
  expect(edad('1999-10-05', new Date(2026, 9, 4))).toBe(26);
  expect(edad('1999-10-05', new Date(2026, 9, 5))).toBe(27);
});

test('imc', () => {
  expect(imc(75, 180)).toBeCloseTo(23.15, 2);
});
