import { diaDe, diaExpo, leerHora, leerReps, textoHora, textoObjetivo } from './horario';

test('días: lunes = 1 en la app, domingo = 1 en expo', () => {
  expect(diaDe(new Date(2026, 9, 12))).toBe(1); // lunes
  expect(diaDe(new Date(2026, 9, 18))).toBe(7); // domingo
  expect(diaExpo(1)).toBe(2);
  expect(diaExpo(6)).toBe(7);
  expect(diaExpo(7)).toBe(1);
});

test('leerHora', () => {
  expect(leerHora('18:30')).toEqual({ hora: 18, minuto: 30 });
  expect(leerHora(' 7.05 ')).toEqual({ hora: 7, minuto: 5 });
  expect(leerHora('7h05')).toEqual({ hora: 7, minuto: 5 });
  expect(leerHora('24:00')).toBeNull();
  expect(leerHora('18:60')).toBeNull();
  expect(leerHora('1830')).toBeNull();
  expect(textoHora(7, 5)).toBe('7:05');
});

test('textoObjetivo', () => {
  expect(textoObjetivo({ series: 3, repsMin: 8, repsMax: 12 })).toBe('3 × 8–12');
  expect(textoObjetivo({ series: 4, repsMin: 10, repsMax: 10 })).toBe('4 × 10');
  expect(textoObjetivo({ series: 3, repsMin: null, repsMax: 6 })).toBe('3 × 6');
  expect(textoObjetivo({ series: 1, repsMin: null, repsMax: null })).toBe('1 serie');
});

test('leerReps', () => {
  expect(leerReps('10')).toEqual({ repsMin: 10, repsMax: 10 });
  expect(leerReps('8-12')).toEqual({ repsMin: 8, repsMax: 12 });
  expect(leerReps(' 6 – 8 ')).toEqual({ repsMin: 6, repsMax: 8 });
  expect(leerReps('12-8')).toBeNull();
  expect(leerReps('0')).toBeNull();
  expect(leerReps('')).toBeNull();
});
