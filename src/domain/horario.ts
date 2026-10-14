/** Días de la app: 1 = lunes … 7 = domingo. */
export const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] as const;

export function diaDe(fecha: Date): number {
  return ((fecha.getDay() + 6) % 7) + 1;
}

/** expo-notifications usa 1 = domingo … 7 = sábado. */
export function diaExpo(dia: number): number {
  return (dia % 7) + 1;
}

/** "18:30" / "7:05" → { hora, minuto }; null si no es una hora válida. */
export function leerHora(s: string): { hora: number; minuto: number } | null {
  const m = /^(\d{1,2})[:.h](\d{2})$/.exec(s.trim());
  if (!m) return null;
  const hora = +m[1];
  const minuto = +m[2];
  return hora < 24 && minuto < 60 ? { hora, minuto } : null;
}

export const textoHora = (hora: number, minuto: number) => `${hora}:${String(minuto).padStart(2, '0')}`;

export function textoObjetivo(o: { series: number; repsMin: number | null; repsMax: number | null }): string {
  const { series, repsMin: a, repsMax: b } = o;
  if (!a && !b) return `${series} ${series === 1 ? 'serie' : 'series'}`;
  return `${series} × ${a && b && a !== b ? `${a}–${b}` : (a ?? b)}`;
}

/** "10" → 10–10; "8-12" → 8–12; null si no es válido. */
export function leerReps(s: string) {
  const m = /^\s*(\d{1,3})\s*(?:[-–a]\s*(\d{1,3}))?\s*$/.exec(s);
  if (!m) return null;
  const a = +m[1];
  const b = m[2] ? +m[2] : a;
  return a > 0 && b >= a ? { repsMin: a, repsMax: b } : null;
}
