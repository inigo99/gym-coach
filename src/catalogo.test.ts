import ejercicios from '../assets/data/ejercicios.json';
import musculos from '../assets/data/musculos.json';

const ids = new Set(musculos.map((m) => m.id));

test('ids únicos y con prefijo cat:', () => {
  expect(new Set(ejercicios.map((e) => e.id)).size).toBe(ejercicios.length);
  ejercicios.forEach((e) => expect(e.id.startsWith('cat:')).toBe(true));
});

test('todo ejercicio tiene músculo principal y todos los músculos existen', () => {
  for (const e of ejercicios) {
    expect(e.musculos_principales.length).toBeGreaterThan(0);
    for (const m of [...e.musculos_principales, ...e.musculos_secundarios]) expect(ids).toContain(m);
  }
});

test('equipo y registro conocidos', () => {
  for (const e of ejercicios) {
    expect(['carga', 'peso_corporal', 'tiempo', 'cardio']).toContain(e.registro);
    expect(e.equipo).toBeTruthy();
  }
});
