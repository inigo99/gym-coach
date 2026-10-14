import ejerciciosAntiguos from '../../assets/data/niveles.json';
import musculos from '../../assets/data/musculos.json';
import lista from './lista-technogym.json';
import { buscar, EJERCICIO, EJERCICIOS, FAMILIAS, normalizar } from '.';
import { POSES } from '@/ilustracion/poses';

const MUSCULOS = new Set(musculos.map((m) => m.id));

test('ids únicos y con prefijo cat:', () => {
  expect(new Set(EJERCICIOS.map((e) => e.id)).size).toBe(EJERCICIOS.length);
  expect(new Set(FAMILIAS.map((f) => f.id)).size).toBe(FAMILIAS.length);
  EJERCICIOS.forEach((e) => expect(e.id).toMatch(/^cat:/));
});

test('se conservan los 36 ejercicios antiguos (historial)', () => {
  const antiguos = ['cat:barbell_bench_press_-_medium_grip', 'cat:dumbbell_bench_press', 'cat:incline_dumbbell_press', 'cat:butterfly', 'cat:pushups', 'cat:dips_-_triceps_version', 'cat:pullups', 'cat:wide-grip_lat_pulldown', 'cat:seated_cable_rows', 'cat:bent_over_barbell_row', 'cat:one-arm_dumbbell_row', 'cat:barbell_deadlift', 'cat:barbell_squat', 'cat:leg_press', 'cat:leg_extensions', 'cat:lying_leg_curls', 'cat:standing_calf_raises', 'cat:barbell_hip_thrust', 'cat:romanian_deadlift', 'cat:dumbbell_lunges', 'cat:standing_military_press', 'cat:dumbbell_shoulder_press', 'cat:side_lateral_raise', 'cat:reverse_machine_flyes', 'cat:barbell_curl', 'cat:hammer_curls', 'cat:triceps_pushdown', 'cat:ez-bar_skullcrusher', 'cat:plank', 'cat:crunches', 'cat:hanging_leg_raise', 'cat:running_treadmill', 'cat:bicycling_stationary', 'cat:rowing_stationary', 'cat:elliptical_trainer', 'cat:stairmaster'];
  antiguos.forEach((id) => expect(EJERCICIO.has(id)).toBe(true));
  Object.keys(ejerciciosAntiguos.ejercicios).forEach((id) => expect(EJERCICIO.has(id)).toBe(true));
});

test('músculos válidos, técnica y pose en cada ejercicio', () => {
  for (const e of EJERCICIOS) {
    expect(e.principales.length).toBeGreaterThan(0);
    [...e.principales, ...e.secundarios].forEach((m) => expect(MUSCULOS).toContain(m));
    expect(e.tecnica.ejecucion.length).toBeGreaterThanOrEqual(2);
    expect(e.tecnica.errores.length).toBeGreaterThanOrEqual(1);
    expect(POSES[e.pose]).toBeDefined();
  }
});

test('cada nombre de la lista de Technogym se encuentra con el buscador', () => {
  const nombres = new Set(EJERCICIOS.flatMap((e) => [e.en, ...(e.alias ?? [])].map(normalizar)));
  const faltan = (lista as string[]).filter((n) => !nombres.has(normalizar(n).replace(/\s+/g, ' ')));
  expect(faltan).toEqual([]);
});

test('buscar: español, inglés, sin tildes y por filtros', () => {
  const ids = (r: ReturnType<typeof buscar>) => r.map((x) => x.familia.id);
  expect(ids(buscar({ texto: 'sentadilla' }))).toContain('sentadilla');
  expect(ids(buscar({ texto: 'squat' }))).toEqual(expect.arrayContaining(['sentadilla', 'sentadilla_salto', 'zancada']));
  expect(ids(buscar({ texto: 'extension cuadriceps' }))).toEqual(['extension_cuadriceps']);
  expect(buscar({ texto: 'press', equipo: 'smith' }).flatMap((x) => x.variantes.map((v) => v.id))).toEqual(
    expect.arrayContaining(['cat:smith_chest_press', 'cat:smith_incline_press', 'cat:smith_shoulder_press']),
  );
  const pecho = buscar({ categoria: 'empuje', musculo: 'pecho' });
  expect(ids(pecho)).toEqual(expect.arrayContaining(['press_pecho', 'aperturas', 'flexiones']));
  expect(buscar({ texto: 'zzzz' })).toEqual([]);
});

test('niveles: tipo reps solo en ejercicios de peso corporal y ratio en los de carga', () => {
  for (const [id, n] of Object.entries(ejerciciosAntiguos.ejercicios)) {
    expect(n.tipo).toBe(EJERCICIO.get(id)!.registro === 'peso_corporal' ? 'reps' : 'ratio');
  }
});
