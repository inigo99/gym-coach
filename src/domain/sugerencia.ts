/**
 * Sugerencias por reglas fijas (sin IA): rutina completa a partir de zona, nivel,
 * objetivo, material, tiempo y esfuerzo; y alternativas a un ejercicio.
 */
import type { Ejercicio, Equipo } from '@/catalogo';

export type Zona = 'cuerpo' | 'superior' | 'pierna' | 'empuje' | 'tiron' | 'pecho' | 'espalda' | 'hombros' | 'brazos' | 'gluteos' | 'core' | 'hiit';
export type NivelSug = 'principiante' | 'intermedio' | 'avanzado';
export type Objetivo = 'fuerza' | 'musculo' | 'resistencia';
export type MaterialSug = 'gimnasio' | 'mancuernas' | 'casa';
export type Esfuerzo = 'suave' | 'normal' | 'duro';

export type Peticion = { zona: Zona; nivel: NivelSug; objetivo: Objetivo; material: MaterialSug; minutos: number; esfuerzo: Esfuerzo };

export const ZONAS: { id: Zona; nombre: string }[] = [
  { id: 'cuerpo', nombre: 'Cuerpo completo' },
  { id: 'superior', nombre: 'Tren superior' },
  { id: 'pierna', nombre: 'Pierna' },
  { id: 'gluteos', nombre: 'Glúteo' },
  { id: 'empuje', nombre: 'Empuje' },
  { id: 'tiron', nombre: 'Tirón' },
  { id: 'pecho', nombre: 'Pecho' },
  { id: 'espalda', nombre: 'Espalda' },
  { id: 'hombros', nombre: 'Hombros' },
  { id: 'brazos', nombre: 'Brazos' },
  { id: 'core', nombre: 'Core' },
  { id: 'hiit', nombre: 'HIIT y cardio' },
];
export const NIVELES_SUG: { id: NivelSug; nombre: string }[] = [
  { id: 'principiante', nombre: 'Principiante' },
  { id: 'intermedio', nombre: 'Intermedio' },
  { id: 'avanzado', nombre: 'Avanzado' },
];
export const OBJETIVOS: { id: Objetivo; nombre: string }[] = [
  { id: 'fuerza', nombre: 'Fuerza' },
  { id: 'musculo', nombre: 'Ganar músculo' },
  { id: 'resistencia', nombre: 'Resistencia' },
];
export const MATERIALES: { id: MaterialSug; nombre: string }[] = [
  { id: 'gimnasio', nombre: 'Gimnasio' },
  { id: 'mancuernas', nombre: 'Mancuernas y banco' },
  { id: 'casa', nombre: 'Sin material' },
];
export const ESFUERZOS: { id: Esfuerzo; nombre: string }[] = [
  { id: 'suave', nombre: 'Suave' },
  { id: 'normal', nombre: 'Normal' },
  { id: 'duro', nombre: 'Duro' },
];
export const MINUTOS = [30, 45, 60, 90] as const;

const PERMITIDO: Record<MaterialSug, Equipo[] | null> = {
  gimnasio: null,
  mancuernas: ['mancuerna', 'banco', 'peso_corporal', 'kettlebell', 'disco', 'cajon'],
  casa: ['peso_corporal', 'banco', 'cajon'], // una silla o un escalón hacen de banco y cajón
};

/** Músculo principal de cada hueco, en orden: primero los multiarticulares grandes. */
const HUECOS: Record<Exclude<Zona, 'hiit'>, string[]> = {
  cuerpo: ['cuadriceps', 'pecho', 'dorsales', 'isquios', 'hombros', 'espalda_media', 'gluteos', 'abdomen', 'biceps', 'triceps'],
  superior: ['pecho', 'dorsales', 'hombros', 'espalda_media', 'pecho', 'triceps', 'biceps', 'abdomen', 'hombros'],
  pierna: ['cuadriceps', 'isquios', 'gluteos', 'cuadriceps', 'isquios', 'gemelos', 'aductores', 'abdomen'],
  empuje: ['pecho', 'hombros', 'pecho', 'triceps', 'hombros', 'triceps', 'abdomen'],
  tiron: ['dorsales', 'espalda_media', 'dorsales', 'biceps', 'trapecio', 'biceps', 'lumbar'],
  gluteos: ['gluteos', 'isquios', 'gluteos', 'abductores', 'cuadriceps', 'gluteos', 'lumbar'],
  pecho: ['pecho', 'pecho', 'pecho', 'triceps', 'hombros', 'triceps', 'abdomen'],
  espalda: ['dorsales', 'espalda_media', 'dorsales', 'espalda_media', 'biceps', 'lumbar', 'biceps', 'trapecio'],
  hombros: ['hombros', 'hombros', 'hombros', 'trapecio', 'triceps', 'hombros'],
  brazos: ['biceps', 'triceps', 'biceps', 'triceps', 'antebrazos', 'biceps', 'triceps'],
  core: ['abdomen', 'abdomen', 'lumbar', 'abdomen', 'abdomen', 'abdomen', 'abdomen'],
};

// Dificultad técnica o de fuerza: 1 guiado o muy asequible, 2 libre, 3 exigente.
const FACIL = new Set(['knee_pushup', 'plank_knees', 'side_bridge_knees', 'supported_squat', 'squat_bw', 'shoulder_bridge', 'crunches', 'ankle_extension', 'box_pushup', 'superman', 'jumping_jacks']);
const DIFICIL = new Set([
  'single_leg_squat', 'dips_-_triceps_version', 'pullups', 'pullup_neutral', 'chin_up', 'hanging_leg_raise', 'ab_wheel', 'eccentric_hamstring',
  'pushup_crawl', 'inverted_pushup', 'pushup_rotation', 'plank_one_arm', 'back_squat_jump', 'box_over_the_top', 'box_jump_pushup', 'eccentric_adductor', 'eccentric_quad',
]);
export function dificultad(e: Ejercicio): 1 | 2 | 3 {
  const id = e.id.replace(/^cat:/, '');
  if (DIFICIL.has(id) || e.familia.categoria === 'potencia') return 3;
  // Equilibrio sobre una pierna o de pie a una mano: no es guiado aunque sea en Smith o polea.
  if (e.familia.id === 'zancada' || /one|single/.test(id)) return 2;
  if (FACIL.has(id) || e.equipo.every((q) => q === 'maquina' || q === 'polea' || q === 'smith' || q === 'cardio')) return 1;
  return 2;
}

const AJUSTE_NIVEL: Record<NivelSug, Record<1 | 2 | 3, number | null>> = {
  principiante: { 1: 3, 2: 1, 3: null }, // null = descartado
  intermedio: { 1: 1.5, 2: 2.5, 3: 1 },
  avanzado: { 1: 0, 2: 2, 3: 2 },
};

/** Puntuación de una variante para un hueco (null = no vale). Pura y determinista. */
function puntuar(e: Ejercicio, musculo: string, hueco: number, p: Peticion): number | null {
  const permitido = PERMITIDO[p.material];
  if (permitido && !e.equipo.every((q) => permitido.includes(q))) return null;
  const cat = e.familia.categoria;
  if (cat === 'cardio' || cat === 'movilidad') return null;
  if (cat === 'pliometria' && p.objetivo !== 'resistencia') return null;
  if (cat === 'potencia' && p.nivel !== 'avanzado') return null;
  if (e.registro === 'cardio') return null;
  const nivel = AJUSTE_NIVEL[p.nivel][dificultad(e)];
  if (nivel == null) return null;

  let s = nivel;
  if (e.principales[0] === musculo) s += 4;
  else if (e.principales.includes(musculo)) s += 2.5;
  else return null;
  // Los primeros huecos piden multiarticulares; los últimos, aislamiento.
  const implicados = e.principales.length + e.secundarios.length * 0.5;
  s += hueco < 2 ? implicados * 0.8 : hueco < 4 ? implicados * 0.3 : 0;
  if (p.objetivo === 'fuerza' && e.registro === 'carga' && (e.equipo.includes('barra') || e.equipo.includes('maquina'))) s += 1;
  if (p.objetivo === 'fuerza' && e.registro === 'tiempo') s -= 2;
  if (p.objetivo === 'resistencia' && (e.registro === 'peso_corporal' || e.equipo.includes('kettlebell'))) s += 0.5;
  // En el gimnasio, para fuerza o músculo, mejor algo que se pueda cargar.
  if (p.material === 'gimnasio' && p.objetivo !== 'resistencia' && e.registro !== 'carga') s -= 1.5;
  // Los olímpicos solo encajan en cuerpo completo; en el resto desplazan a los básicos.
  if (cat === 'potencia' && p.zona !== 'cuerpo') s -= 3;
  // Las combinadas (zancada + press, salto + burpee…) y las de polea doble son menos habituales.
  if (e.en.includes('+') || e.en.startsWith('Dap ')) s -= 1;
  s -= e.familia.variantes.findIndex((v) => v.id === e.id) * 0.1;
  return s;
}

export type Prescripcion = { series: number; repsMin: number | null; repsMax: number | null; descansoS: number };

// En zonas de músculos pequeños todo es trabajo accesorio: series más cortas y menos descanso.
const ACCESORIAS: Zona[] = ['brazos', 'hombros', 'core'];

export function prescripcion(e: Ejercicio, hueco: number, p: Peticion): Prescripcion {
  if (p.zona === 'hiit') return prescripcionHiit(e, p);
  if (ACCESORIAS.includes(p.zona)) hueco = Math.max(hueco, 2);
  const base: Record<Objetivo, [number, number, number, number]> = {
    fuerza: hueco < 2 ? [4, 4, 6, 150] : [3, 6, 10, 120],
    musculo: hueco < 2 ? [4, 6, 10, 120] : [3, 8, 12, 90],
    resistencia: [3, 15, 20, 45],
  };
  let [series, min, max, descanso] = base[p.objetivo];
  if (p.esfuerzo === 'suave') series -= 1;
  if (p.esfuerzo === 'duro') series += 1;
  if (p.nivel === 'principiante') series = Math.min(series, 3);
  series = Math.max(2, series);
  if (p.esfuerzo === 'duro') descanso = Math.round(descanso * 0.8);
  if (e.registro === 'tiempo') return { series, repsMin: null, repsMax: null, descansoS: Math.min(descanso, 60) };
  return { series, repsMin: min, repsMax: max, descansoS: descanso };
}

/** Minutos que ocupa un ejercicio: series × (≈45 s de trabajo + descanso) + 1 min de preparación. */
const minutosDe = (x: Prescripcion) => (x.series * (45 + x.descansoS) + 60) / 60;
const CALENTAMIENTO = 5;
/** Duración estimada de una rutina, con 5 min de calentamiento. */
export const duracion = (xs: Prescripcion[]) => Math.round(CALENTAMIENTO + xs.reduce((m, x) => m + minutosDe(x), 0));

export type Hueco = { musculo: string; opciones: Ejercicio[] }; // opciones ordenadas: la primera es la sugerida
export type Sugerencia = { nombre: string; huecos: Hueco[]; aviso?: string };

export function sugerirRutina(p: Peticion, catalogo: Ejercicio[]): Sugerencia {
  const nombre = `${ZONAS.find((z) => z.id === p.zona)!.nombre} · ${OBJETIVOS.find((o) => o.id === p.objetivo)!.nombre}`;
  if (p.zona === 'hiit') return { nombre, huecos: hiit(p, catalogo) };

  const huecos: Hueco[] = [];
  const usadas = new Set<string>();
  const familias = new Set<string>();
  let minutos = CALENTAMIENTO;
  for (const [i, musculo] of HUECOS[p.zona].entries()) {
    const opciones = catalogo
      .filter((e) => !usadas.has(e.id))
      // Otra variante de una familia ya elegida solo si no hay nada mejor (p. ej. dos curls en brazos).
      .map((e) => ({ e, s: puntuar(e, musculo, i, p) }))
      .filter((x): x is { e: Ejercicio; s: number } => x.s != null)
      .map((x) => (familias.has(x.e.familia.id) ? { ...x, s: x.s - 3 } : x))
      .sort((a, b) => b.s - a.s)
      .map((x) => x.e);
    if (!opciones.length) continue;
    const coste = minutosDe(prescripcion(opciones[0], i, p));
    if (huecos.length >= 2 && minutos + coste > p.minutos) break;
    minutos += coste;
    usadas.add(opciones[0].id);
    familias.add(opciones[0].familia.id);
    huecos.push({ musculo, opciones: opciones.slice(0, 6) });
  }
  const aviso = huecos.length < 3 && p.material !== 'gimnasio' ? 'Con este material hay pocos ejercicios para esta zona. Con mancuernas o en el gimnasio salen más.' : undefined;
  return { nombre, huecos, aviso };
}

/** Circuito: saltos y cardio intercalados con core, según material y nivel. */
function hiit(p: Peticion, catalogo: Ejercicio[]): Hueco[] {
  const permitido = PERMITIDO[p.material];
  const vale = (e: Ejercicio) =>
    (!permitido || e.equipo.every((q) => permitido.includes(q))) && AJUSTE_NIVEL[p.nivel][dificultad(e)] != null && e.registro !== 'cardio';
  const de = (cats: string[]) => catalogo.filter((e) => cats.includes(e.familia.categoria) && vale(e));
  const saltos = de(['pliometria']);
  const core = de(['core']).filter((e) => e.registro !== 'carga' && e.principales[0] === 'abdomen');
  const n = Math.max(3, Math.min(8, Math.floor((p.minutos - CALENTAMIENTO) / 5)));
  const huecos: Hueco[] = [];
  const usadas = new Set<string>();
  for (let i = 0; i < n; i++) {
    const lista = (i % 3 === 2 ? core : saltos).filter((e) => !usadas.has(e.familia.id));
    if (!lista.length) break;
    usadas.add(lista[0].familia.id);
    huecos.push({ musculo: lista[0].principales[0], opciones: lista.slice(0, 6) });
  }
  return huecos;
}

function prescripcionHiit(e: Ejercicio, p: Peticion): Prescripcion {
  const series = p.esfuerzo === 'suave' ? 3 : p.esfuerzo === 'duro' ? 5 : 4;
  const conReps = e.registro === 'carga' || e.registro === 'peso_corporal';
  return { series, repsMin: conReps ? 10 : null, repsMax: conReps ? 15 : null, descansoS: p.esfuerzo === 'duro' ? 20 : 30 };
}

/** Nivel por defecto a partir de la puntuación media de las marcas (1–5); sin datos, principiante. */
export function nivelDesdePuntos(puntos: number[]): NivelSug {
  if (!puntos.length) return 'principiante';
  const media = puntos.reduce((a, b) => a + b, 0) / puntos.length;
  return media < 2.5 ? 'principiante' : media < 3.8 ? 'intermedio' : 'avanzado';
}

const tipo = (e: Ejercicio) => (['pliometria', 'cardio', 'movilidad'].includes(e.familia.categoria) ? e.familia.categoria : 'fuerza');

/** Otros ejercicios (de otras familias) que trabajan lo mismo, de más a menos parecido. */
export function alternativas(e: Ejercicio, catalogo: Ejercicio[], n = 4): Ejercicio[] {
  const comun = (a: string[], b: string[]) => a.filter((m) => b.includes(m)).length;
  const vistos = new Set<string>();
  return catalogo
    .filter((o) => o.familia.id !== e.familia.id && tipo(o) === tipo(e))
    .map((o) => ({
      o,
      s: (o.principales[0] === e.principales[0] ? 3 : 0) + comun(o.principales, e.principales) * 2 + comun(o.secundarios, e.secundarios) * 0.5 - o.familia.variantes.findIndex((v) => v.id === o.id) * 0.3,
    }))
    .filter((x) => x.s >= 3)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.o)
    .filter((o) => !vistos.has(o.familia.id) && vistos.add(o.familia.id))
    .slice(0, n);
}
