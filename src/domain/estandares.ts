import niveles from '@/assets/data/niveles.json';
import { EJERCICIOS, type Ejercicio } from '@/catalogo';

import type { Estandar } from './nivel';

const PROPIOS = niveles.ejercicios as Record<string, Estandar & { url: string }>;

/** Máquinas asistidas: el peso apuntado es ayuda y se resta del corporal. */
export const ASISTIDAS = new Set(['cat:assisted_pullup_machine', 'cat:assisted_dip_machine']);

// Genéricos, a falta de uno parecido (orientativos): máquina o polea de aislamiento, peso corporal y segundos aguantados.
const GENERICO: Record<Estandar['tipo'], Estandar & { url: string }> = {
  ratio: { ...PROPIOS['cat:triceps_pushdown'], url: '' },
  reps: { ...PROPIOS['cat:pushups'], url: '' },
  segundos: { tipo: 'segundos', h: [15, 45, 90, 150, 240], m: [10, 30, 75, 120, 200], url: '' },
};

const mancuerna = (e: Ejercicio) => e.equipo[0] === 'mancuerna';

/**
 * Estándar de cada ejercicio: el suyo; si no tiene, el de otra variante de su familia (mejor con el mismo material)
 * y, si tampoco, el de un ejercicio con su músculo principal; `ref` dice de cuál viene.
 * Si no hay ninguno, uno genérico. Carga → ratio, peso corporal → repeticiones, tiempo → segundos; el cardio no tiene nivel de fuerza.
 */
// ponytail: estándar prestado sin factor de corrección (una máquina no carga igual que una barra); es orientativo.
export const ESTANDARES: Record<string, Estandar & { url: string; ref?: string }> = Object.fromEntries(
  EJERCICIOS.flatMap((e) => {
    if (PROPIOS[e.id]) return [[e.id, PROPIOS[e.id]]];
    const tipo = ASISTIDAS.has(e.id) || e.registro === 'peso_corporal' ? 'reps' : e.registro === 'carga' ? 'ratio' : e.registro === 'tiempo' ? 'segundos' : null;
    if (!tipo) return [];
    const vale = (o: Ejercicio) => PROPIOS[o.id]?.tipo === tipo;
    const ref =
      EJERCICIOS.find((o) => o.familia === e.familia && vale(o) && mancuerna(o) === mancuerna(e)) ??
      EJERCICIOS.find((o) => o.familia === e.familia && vale(o)) ??
      EJERCICIOS.find((o) => vale(o) && o.principales.includes(e.principales[0]));
    return [[e.id, ref ? { ...PROPIOS[ref.id], ref: ref.id } : { ...GENERICO[tipo], ref: 'generico' }]];
  }),
);
