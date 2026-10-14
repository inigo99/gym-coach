import { cargaSerie, type Registro } from './calculos';

export type SerieReg = {
  registro: Registro;
  pesoKg: number | null;
  reps: number | null;
  duracionS: number | null;
  distanciaM: number | null;
  calentamiento: boolean;
};

const n = (x: number) => x.toLocaleString('es-ES', { maximumFractionDigits: 2 });

/** "1:05", "12:30", "1:02:03" */
export function reloj(segundos: number): string {
  const s = Math.max(0, Math.round(segundos));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}

/** Texto corto de una serie según el tipo de registro. */
export function textoSerie(s: SerieReg): string {
  switch (s.registro) {
    case 'carga':
      return `${n(s.pesoKg ?? 0)} kg × ${s.reps ?? 0}`;
    case 'peso_corporal':
      return `${s.pesoKg ? `+${n(s.pesoKg)} kg` : 'PC'} × ${s.reps ?? 0}`;
    case 'tiempo':
      return reloj(s.duracionS ?? 0);
    case 'cardio':
      return [reloj(s.duracionS ?? 0), s.distanciaM ? `${n(s.distanciaM / 1000)} km` : null].filter(Boolean).join(' · ');
  }
}

/** Series de trabajo y volumen (kg) de una sesión. En peso corporal suma el peso del usuario ese día. */
export function resumen(series: SerieReg[], pesoCorporalKg: number | null) {
  let volumenKg = 0;
  let trabajo = 0;
  for (const s of series) {
    if (s.calentamiento) continue;
    trabajo++;
    if ((s.registro === 'carga' || s.registro === 'peso_corporal') && s.reps) {
      volumenKg += cargaSerie(s.registro, s.pesoKg ?? 0, pesoCorporalKg ?? 0) * s.reps;
    }
  }
  return { series: trabajo, volumenKg };
}
