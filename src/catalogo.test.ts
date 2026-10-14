import ejercicios from '../assets/data/ejercicios.json';
import musculos from '../assets/data/musculos.json';
import niveles from '../assets/data/niveles.json';
import imagenes from '../assets/data/imagenes.json';
import tecnica from '../assets/data/tecnica.json';

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

test('técnica: una ficha por ejercicio con ejecución y errores', () => {
  const t = tecnica as Record<string, { ajustes?: string[]; ejecucion: string[]; errores: string[] }>;
  expect(Object.keys(t).sort()).toEqual(ejercicios.map((e) => e.id).sort());
  for (const f of Object.values(t)) {
    expect(f.ejecucion.length).toBeGreaterThanOrEqual(2);
    expect(f.errores.length).toBeGreaterThanOrEqual(1);
  }
});

test('niveles: todos los de fuerza menos la plancha; tipo reps solo en peso corporal', () => {
  const n = niveles.ejercicios as Record<string, { tipo: string }>;
  for (const e of ejercicios) {
    if (e.registro === 'carga' || e.registro === 'peso_corporal') expect(n[e.id]?.tipo).toBe(e.registro === 'carga' ? 'ratio' : 'reps');
    else expect(n[e.id]).toBeUndefined();
  }
});

test('imágenes: solo de wger, con licencia y de ejercicios del catálogo', () => {
  const ids = new Set(ejercicios.map((e) => e.id));
  for (const [id, v] of Object.entries(imagenes.ejercicios)) {
    expect(ids).toContain(id);
    expect(v.imagenes.length).toBeGreaterThan(0);
    for (const i of v.imagenes) {
      expect(i.url.startsWith('https://wger.de/media/')).toBe(true);
      expect(i.licencia).toMatch(/^CC/);
      expect(i.licencia_url).toMatch(/^https:\/\/creativecommons\.org\//);
    }
  }
});
