import { e1rm } from './calculos';

export const NIVELES = ['Principiante', 'Novato', 'Intermedio', 'Avanzado', 'Élite'] as const;

export type Estandar = { tipo: 'ratio' | 'reps' | 'segundos'; h: number[]; m: number[] };

/**
 * Puntuación continua 1,0–5,0 a partir de los 5 umbrales (principiante … élite).
 * Por debajo del primero sigue siendo 1 (principiante); desde el último, 5 (élite).
 */
export function puntuacion(x: number, umbrales: number[]): number {
  if (x <= umbrales[0]) return 1;
  for (let k = 1; k < 5; k++) {
    if (x < umbrales[k]) return k + (x - umbrales[k - 1]) / (umbrales[k] - umbrales[k - 1]);
  }
  return 5;
}

/** Nivel mostrado (0–4 en NIVELES) y % recorrido hacia el siguiente. */
export function nivel(p: number) {
  const i = Math.min(4, Math.floor(p) - 1);
  return { indice: i, nombre: NIVELES[i], haciaSiguiente: i === 4 ? null : p - Math.floor(p) };
}

export type SerieNivel = { pesoKg: number | null; reps: number | null; pesoCorporalKg: number; duracionS?: number | null };

/**
 * Marca comparable con el estándar: 1RM estimado / peso corporal (ratio) o
 * repeticiones equivalentes sin lastre (reps; con lastre se convierte con Epley) o segundos aguantados.
 */
export function marca(tipo: Estandar['tipo'], series: SerieNivel[]): number | null {
  let mejor: number | null = null;
  for (const s of series) {
    if (tipo === 'segundos') {
      if (s.duracionS && (mejor == null || s.duracionS > mejor)) mejor = s.duracionS;
      continue;
    }
    if (!s.reps || s.pesoCorporalKg <= 0) continue;
    let v: number | null;
    if (tipo === 'ratio') {
      const rm = s.pesoKg ? e1rm(s.pesoKg, Math.min(s.reps, 12)) : null; // más de 12 reps cuenta como 12: se queda corto, pero puntúa
      v = rm && rm / s.pesoCorporalKg;
    } else {
      const lastre = s.pesoKg ?? 0; // negativo: ayuda de una máquina asistida
      const rm = lastre !== 0 ? e1rm(Math.max(1, s.pesoCorporalKg + lastre), Math.min(s.reps, 12)) : null;
      v = rm ? 30 * (rm / s.pesoCorporalKg - 1) : s.reps;
    }
    if (v != null && (mejor == null || v > mejor)) mejor = v;
  }
  return mejor;
}

/**
 * Nivel por grupo muscular: media ponderada de la puntuación de sus ejercicios
 * (músculo principal ×1, secundario ×0,5). Solo grupos con al menos un ejercicio
 * con marca en el que ese músculo es principal.
 */
export function nivelPorGrupo(ejercicios: { principales: string[]; secundarios: string[]; puntuacion: number }[]) {
  const acc = new Map<string, { suma: number; peso: number; principal: boolean }>();
  const sumar = (m: string, p: number, w: number, principal: boolean) => {
    const a = acc.get(m) ?? { suma: 0, peso: 0, principal: false };
    acc.set(m, { suma: a.suma + p * w, peso: a.peso + w, principal: a.principal || principal });
  };
  for (const e of ejercicios) {
    e.principales.forEach((m) => sumar(m, e.puntuacion, 1, true));
    e.secundarios.forEach((m) => sumar(m, e.puntuacion, 0.5, false));
  }
  return new Map([...acc].filter(([, a]) => a.principal).map(([m, a]) => [m, a.suma / a.peso]));
}

/** Series efectivas por semana de cada músculo (principal 1, secundario 0,5). */
export function seriesPorSemana(series: { principales: string[]; secundarios: string[] }[], semanas: number) {
  const acc = new Map<string, number>();
  for (const s of series) {
    s.principales.forEach((m) => acc.set(m, (acc.get(m) ?? 0) + 1 / semanas));
    s.secundarios.forEach((m) => acc.set(m, (acc.get(m) ?? 0) + 0.5 / semanas));
  }
  return acc;
}

export type SerieHistorica = { ejercicioId: string; inicio: string; pesoKg: number | null; reps: number | null; duracionS?: number | null; calentamiento: boolean };

/**
 * Puntuación de cada ejercicio con estándar a partir de su mejor marca en las series dadas
 * (normalmente las últimas 8 semanas), con el peso corporal de cada fecha.
 */
export function puntuaciones(
  series: SerieHistorica[],
  pesoEn: (fechaIso: string) => number | null,
  sexo: 'h' | 'm',
  estandares: Record<string, Estandar>,
) {
  const porEj = new Map<string, SerieNivel[]>();
  for (const s of series) {
    const pc = pesoEn(s.inicio);
    if (s.calentamiento || !pc || !estandares[s.ejercicioId]) continue;
    const lista = porEj.get(s.ejercicioId) ?? porEj.set(s.ejercicioId, []).get(s.ejercicioId)!;
    lista.push({ pesoKg: s.pesoKg, reps: s.reps, duracionS: s.duracionS, pesoCorporalKg: pc });
  }
  const out = new Map<string, { marca: number; puntuacion: number }>();
  for (const [id, ss] of porEj) {
    const est = estandares[id];
    const m = marca(est.tipo, ss);
    if (m != null) out.set(id, { marca: m, puntuacion: puntuacion(m, est[sexo]) });
  }
  return out;
}
