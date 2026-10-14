import { cargaSerie, e1rm, type Registro } from './calculos';
import { reloj } from './sesion';

export type SerieFecha = {
  sesionId: number;
  inicio: string; // ISO de la sesión
  pesoKg: number | null;
  reps: number | null;
  duracionS: number | null;
  distanciaM: number | null;
  calentamiento: boolean;
};

export type Metrica = 'e1rm' | 'peso_max' | 'volumen' | 'reps_max' | 'duracion' | 'distancia' | 'ritmo';

export const METRICAS: Record<Registro, { id: Metrica; nombre: string; unidad: string; menorEsMejor?: boolean }[]> = {
  carga: [
    { id: 'e1rm', nombre: '1RM estimado', unidad: 'kg' },
    { id: 'peso_max', nombre: 'Peso máximo', unidad: 'kg' },
    { id: 'volumen', nombre: 'Volumen', unidad: 'kg' },
  ],
  peso_corporal: [
    { id: 'e1rm', nombre: '1RM estimado', unidad: 'kg' },
    { id: 'reps_max', nombre: 'Reps máximas', unidad: 'reps' },
    { id: 'volumen', nombre: 'Volumen', unidad: 'kg' },
  ],
  tiempo: [{ id: 'duracion', nombre: 'Mejor tiempo', unidad: 's' }],
  cardio: [
    { id: 'duracion', nombre: 'Duración', unidad: 's' },
    { id: 'distancia', nombre: 'Distancia', unidad: 'km' },
    { id: 'ritmo', nombre: 'Ritmo', unidad: 'min/km', menorEsMejor: true },
  ],
};

/** Peso corporal en una fecha: la última medición hasta ese día, o la primera si todas son posteriores. */
export function pesoEnFecha(mediciones: { fecha: string; pesoKg: number }[], fechaIso: string): number | null {
  const dia = fechaIso.slice(0, 10);
  const orden = [...mediciones].sort((a, b) => a.fecha.localeCompare(b.fecha));
  return orden.filter((m) => m.fecha <= dia).at(-1)?.pesoKg ?? orden[0]?.pesoKg ?? null;
}

/** Un valor de la métrica por sesión (sin calentamientos), ordenado por fecha. */
export function serieTemporal(registro: Registro, metrica: Metrica, series: SerieFecha[], mediciones: { fecha: string; pesoKg: number }[] = []) {
  const porSesion = new Map<number, SerieFecha[]>();
  for (const s of series) if (!s.calentamiento) porSesion.set(s.sesionId, [...(porSesion.get(s.sesionId) ?? []), s]);

  const puntos: { fecha: string; valor: number }[] = [];
  for (const ss of porSesion.values()) {
    const fecha = ss[0].inicio;
    const pc = pesoEnFecha(mediciones, fecha) ?? 0;
    const carga = (s: SerieFecha) => cargaSerie(registro, s.pesoKg ?? 0, pc);
    const max = (xs: (number | null)[]) => Math.max(0, ...xs.filter((x): x is number => x != null));
    const suma = (xs: (number | null)[]) => xs.reduce<number>((t, x) => t + (x ?? 0), 0);
    let valor: number | null = null;
    switch (metrica) {
      case 'e1rm':
        valor = max(ss.map((s) => (s.reps && carga(s) > 0 ? e1rm(carga(s), s.reps) : null)));
        break;
      case 'peso_max':
        valor = max(ss.map(carga));
        break;
      case 'volumen':
        valor = suma(ss.map((s) => carga(s) * (s.reps ?? 0)));
        break;
      case 'reps_max':
        valor = max(ss.map((s) => s.reps));
        break;
      case 'duracion':
        valor = registro === 'cardio' ? suma(ss.map((s) => s.duracionS)) : max(ss.map((s) => s.duracionS));
        break;
      case 'distancia':
        valor = suma(ss.map((s) => s.distanciaM)) / 1000;
        break;
      case 'ritmo': {
        const km = suma(ss.map((s) => s.distanciaM)) / 1000;
        valor = km > 0 ? suma(ss.map((s) => s.duracionS)) / 60 / km : null;
        break;
      }
    }
    if (valor != null && valor > 0) puntos.push({ fecha, valor });
  }
  return puntos.sort((a, b) => a.fecha.localeCompare(b.fecha));
}

/** Mejor punto de una serie temporal. */
export function record(puntos: { fecha: string; valor: number }[], menorEsMejor = false) {
  return puntos.reduce<(typeof puntos)[number] | null>((m, p) => (!m || (menorEsMejor ? p.valor < m.valor : p.valor > m.valor) ? p : m), null);
}

export const RANGOS = [
  { id: '1m', nombre: '1 m', dias: 31 },
  { id: '3m', nombre: '3 m', dias: 92 },
  { id: '1a', nombre: '1 a', dias: 366 },
  { id: 'todo', nombre: 'Todo', dias: Infinity },
] as const;

export function enRango<T extends { fecha: string }>(puntos: T[], dias: number, hoy = new Date()) {
  const desde = hoy.getTime() - dias * 86_400_000;
  return puntos.filter((p) => Date.parse(p.fecha) >= desde);
}

const dec = (v: number, d: number) => v.toLocaleString('es-ES', { maximumFractionDigits: d });

/** Texto de un valor según la unidad de la métrica. */
export function formatoMetrica(unidad: string): (v: number) => string {
  switch (unidad) {
    case 's':
      return (v) => reloj(v);
    case 'min/km':
      return (v) => `${reloj(v * 60)} /km`;
    case 'km':
      return (v) => `${dec(v, 2)} km`;
    case 'reps':
      return (v) => `${Math.round(v)} reps`;
    default:
      return (v) => `${dec(v, 1)} ${unidad}`;
  }
}
