import { EJERCICIO, EJERCICIOS } from '@/catalogo';
import { alternativas, dificultad, MATERIALES, MINUTOS, NIVELES_SUG, nivelDesdePuntos, OBJETIVOS, prescripcion, sugerirRutina, ZONAS, type Peticion } from './sugerencia';

const base: Peticion = { zona: 'cuerpo', nivel: 'intermedio', objetivo: 'musculo', material: 'gimnasio', minutos: 60, esfuerzo: 'normal' };
const elegidos = (p: Peticion) => sugerirRutina(p, EJERCICIOS).huecos.map((h) => h.opciones[0]);

test('toda combinación da al menos 2 ejercicios distintos y prescripciones válidas', () => {
  for (const { id: zona } of ZONAS)
    for (const { id: nivel } of NIVELES_SUG)
      for (const { id: material } of MATERIALES)
        for (const { id: objetivo } of OBJETIVOS) {
          const p = { ...base, zona, nivel, material, objetivo, minutos: 30 };
          const s = sugerirRutina(p, EJERCICIOS);
          const es = s.huecos.map((h) => h.opciones[0]);
          // Sin material el catálogo se queda corto en espalda y hombro: se avisa en vez de rellenar.
          expect(es.length >= 2 || (es.length >= 1 && s.aviso)).toBeTruthy();
          expect(new Set(es.map((e) => e.id)).size).toBe(es.length);
          es.forEach((e, i) => {
            const x = prescripcion(e, i, p);
            expect(x.series).toBeGreaterThanOrEqual(2);
            if (x.repsMin != null) expect(x.repsMax!).toBeGreaterThanOrEqual(x.repsMin);
          });
        }
});

test('respeta el material y el nivel', () => {
  for (const { id: zona } of ZONAS) {
    elegidos({ ...base, zona, material: 'casa' }).forEach((e) => expect(e.equipo.every((q) => ['peso_corporal', 'banco', 'cajon'].includes(q))).toBe(true));
    elegidos({ ...base, zona, nivel: 'principiante' }).forEach((e) => expect(dificultad(e)).toBeLessThan(3));
  }
});

test('más tiempo, más ejercicios; las zonas grandes empiezan por un básico', () => {
  const n = MINUTOS.map((minutos) => elegidos({ ...base, minutos }).length);
  expect([...n].sort((a, b) => a - b)).toEqual(n);
  expect(n[3]).toBeGreaterThan(n[0]);
  expect(elegidos({ ...base, zona: 'pierna', nivel: 'avanzado', objetivo: 'fuerza' })[0].id).toBe('cat:barbell_squat');
  expect(elegidos({ ...base, zona: 'pecho' })[0].familia.id).toBe('press_pecho');
});

test('fuerza: menos repeticiones y más descanso que resistencia', () => {
  const e = EJERCICIO.get('cat:barbell_squat')!;
  const f = prescripcion(e, 0, { ...base, objetivo: 'fuerza' });
  const r = prescripcion(e, 0, { ...base, objetivo: 'resistencia' });
  expect(f.repsMax!).toBeLessThan(r.repsMin!);
  expect(f.descansoS).toBeGreaterThan(r.descansoS);
});

test('alternativas: otras familias que trabajan lo mismo, sin saltos ni estiramientos', () => {
  const alt = alternativas(EJERCICIO.get('cat:wide-grip_lat_pulldown')!, EJERCICIOS);
  expect(alt.map((e) => e.familia.id)).toContain('dominadas');
  alt.forEach((e) => {
    expect(e.familia.id).not.toBe('jalon');
    expect(['pliometria', 'movilidad', 'cardio']).not.toContain(e.familia.categoria);
  });
});

test('nivel por defecto desde las marcas', () => {
  expect(nivelDesdePuntos([])).toBe('principiante');
  expect(nivelDesdePuntos([3, 3.2])).toBe('intermedio');
  expect(nivelDesdePuntos([4.5])).toBe('avanzado');
});
