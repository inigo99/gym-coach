import { enRango, formatoMetrica, pesoEnFecha, record, serieTemporal, type SerieFecha } from './progreso';

const s = (sesionId: number, inicio: string, x: Partial<SerieFecha>): SerieFecha => ({ sesionId, inicio, pesoKg: null, reps: null, duracionS: null, distanciaM: null, calentamiento: false, ...x });

const press = [
  s(1, '2026-09-01T18:00:00Z', { pesoKg: 20, reps: 15, calentamiento: true }),
  s(1, '2026-09-01T18:00:00Z', { pesoKg: 60, reps: 10 }),
  s(1, '2026-09-01T18:00:00Z', { pesoKg: 65, reps: 5 }),
  s(2, '2026-09-08T18:00:00Z', { pesoKg: 70, reps: 3 }),
];

test('fuerza: 1RM, peso máximo y volumen por sesión, sin calentamiento', () => {
  expect(serieTemporal('carga', 'e1rm', press).map((p) => +p.valor.toFixed(1))).toEqual([80, 77]);
  expect(serieTemporal('carga', 'peso_max', press).map((p) => p.valor)).toEqual([65, 70]);
  expect(serieTemporal('carga', 'volumen', press).map((p) => p.valor)).toEqual([925, 210]);
});

test('peso corporal: usa la medición de esa fecha', () => {
  const dominadas = [s(1, '2026-09-01T18:00:00Z', { reps: 10 }), s(2, '2026-10-01T18:00:00Z', { pesoKg: 10, reps: 5 })];
  const med = [
    { fecha: '2026-08-30', pesoKg: 80 },
    { fecha: '2026-09-20', pesoKg: 78 },
  ];
  expect(serieTemporal('peso_corporal', 'volumen', dominadas, med).map((p) => p.valor)).toEqual([800, 440]);
  expect(serieTemporal('peso_corporal', 'reps_max', dominadas, med).map((p) => p.valor)).toEqual([10, 5]);
});

test('cardio: duración y distancia sumadas, ritmo en min/km', () => {
  const cinta = [s(1, '2026-09-01T08:00:00Z', { duracionS: 1200, distanciaM: 3000 }), s(1, '2026-09-01T08:00:00Z', { duracionS: 600, distanciaM: 1000 }), s(2, '2026-09-02T08:00:00Z', { duracionS: 900 })];
  expect(serieTemporal('cardio', 'duracion', cinta).map((p) => p.valor)).toEqual([1800, 900]);
  expect(serieTemporal('cardio', 'distancia', cinta).map((p) => p.valor)).toEqual([4]);
  expect(serieTemporal('cardio', 'ritmo', cinta).map((p) => p.valor)).toEqual([7.5]);
});

test('record y rango', () => {
  const p = [
    { fecha: '2026-01-01', valor: 5 },
    { fecha: '2026-09-01', valor: 7 },
    { fecha: '2026-10-01', valor: 6 },
  ];
  expect(record(p)?.valor).toBe(7);
  expect(record(p, true)?.valor).toBe(5);
  expect(record([])).toBeNull();
  expect(enRango(p, 31, new Date('2026-10-14'))).toHaveLength(1);
  expect(enRango(p, Infinity)).toHaveLength(3);
});

test('pesoEnFecha', () => {
  const med = [{ fecha: '2026-09-20', pesoKg: 78 }, { fecha: '2026-08-30', pesoKg: 80 }];
  expect(pesoEnFecha(med, '2026-09-25T10:00:00Z')).toBe(78);
  expect(pesoEnFecha(med, '2026-08-01T10:00:00Z')).toBe(80);
  expect(pesoEnFecha([], '2026-08-01')).toBeNull();
});

test('formatoMetrica', () => {
  expect(formatoMetrica('kg')(82.46)).toBe('82,5 kg');
  expect(formatoMetrica('s')(95)).toBe('1:35');
  expect(formatoMetrica('min/km')(7.5)).toBe('7:30 /km');
  expect(formatoMetrica('km')(3.456)).toBe('3,46 km');
  expect(formatoMetrica('reps')(9.6)).toBe('10 reps');
});
