export type Registro = 'carga' | 'peso_corporal' | 'tiempo' | 'cardio';

/** 1RM estimado (Epley). Solo para 1–12 repeticiones; fuera de ese rango no es fiable. */
export function e1rm(pesoKg: number, reps: number): number | null {
  if (!(pesoKg > 0) || !Number.isInteger(reps) || reps < 1 || reps > 12) return null;
  return reps === 1 ? pesoKg : pesoKg * (1 + reps / 30);
}

/** Carga real de una serie: en ejercicios con peso corporal se suma el lastre. */
export function cargaSerie(registro: Registro, pesoKg: number, pesoCorporalKg: number): number {
  return registro === 'peso_corporal' ? pesoCorporalKg + pesoKg : pesoKg;
}

export type SerieFuerza = { pesoKg: number; reps: number; calentamiento?: boolean };

/** Volumen = Σ peso × reps, sin series de calentamiento. */
export function volumen(series: SerieFuerza[]): number {
  return series.reduce((t, s) => (s.calentamiento ? t : t + s.pesoKg * s.reps), 0);
}

/** Edad en años cumplidos. `nacimiento` en formato AAAA-MM-DD. */
export function edad(nacimiento: string, hoy = new Date()): number {
  const [a, m, d] = nacimiento.split('-').map(Number);
  const cumplido = hoy.getMonth() + 1 > m || (hoy.getMonth() + 1 === m && hoy.getDate() >= d);
  return hoy.getFullYear() - a - (cumplido ? 0 : 1);
}

export function imc(pesoKg: number, alturaCm: number): number {
  return pesoKg / (alturaCm / 100) ** 2;
}
