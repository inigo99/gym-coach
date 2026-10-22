/** Última vez y mejor serie de cada ejercicio, a partir de las series de sesiones terminadas (sin calentamientos). */
export type SerieMarca = { ejercicioId: string; sesionId: number; inicio: string; pesoKg: number | null; reps: number | null; duracionS: number | null; distanciaM: number | null; calentamiento: boolean };
export type Marca<S> = { ultima: S; fecha: string; mejor: S };

// Más peso; a igual peso, más repeticiones; si no hay peso ni reps, más tiempo o distancia.
const clave = (s: SerieMarca) => [s.pesoKg ?? 0, s.reps ?? 0, s.duracionS ?? 0, s.distanciaM ?? 0];
export const mejorQue = (a: SerieMarca, b: SerieMarca) => {
  const [x, y] = [clave(a), clave(b)];
  for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return x[i] > y[i];
  return false;
};

export function marcasPorEjercicio<S extends SerieMarca>(series: S[]) {
  const m = new Map<string, Marca<S>>();
  for (const s of series) {
    if (s.calentamiento) continue;
    const a = m.get(s.ejercicioId);
    if (!a) {
      m.set(s.ejercicioId, { ultima: s, fecha: s.inicio, mejor: s });
      continue;
    }
    // "Última vez": la mejor serie de la sesión más reciente.
    if (s.inicio > a.fecha || (s.inicio === a.fecha && mejorQue(s, a.ultima))) Object.assign(a, { ultima: s, fecha: s.inicio });
    if (mejorQue(s, a.mejor)) a.mejor = s;
  }
  return m;
}
