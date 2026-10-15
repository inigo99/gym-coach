/**
 * Programas de varias semanas por objetivo (perder peso, ganar músculo, definir):
 * reparto de días, rutinas de cada día, cardio, pauta de cada semana y seguimiento.
 * Reglas fijas, sin IA.
 */
import { EJERCICIO, type Ejercicio } from '@/catalogo';
import type { ObjetivoCuerpo } from './nutricion';
import { prescripcion, sugerirRutina, type MaterialSug, type NivelSug, type Peticion, type Prescripcion, type Zona } from './sugerencia';

export type { ObjetivoCuerpo } from './nutricion';

export const OBJETIVOS_PROGRAMA: { id: ObjetivoCuerpo; nombre: string; descripcion: string }[] = [
  { id: 'perder_peso', nombre: 'Perder peso', descripcion: 'Fuerza para conservar músculo y cardio en cada sesión.' },
  { id: 'musculo', nombre: 'Ganar músculo', descripcion: 'Más volumen de fuerza y descansos completos; cardio opcional.' },
  { id: 'definir', nombre: 'Definir', descripcion: 'Fuerza con descansos cortos y cardio moderado.' },
];
export const DIAS_PROGRAMA = [2, 3, 4, 5, 6] as const;
export const SEMANAS_PROGRAMA = [4, 8, 12] as const;

export type ConfigPrograma = { objetivo: ObjetivoCuerpo; dias: number; semanas: number; nivel: NivelSug; material: MaterialSug; minutos: number };

/** Reparto según los días por semana: zona y día (1 = lunes). */
const REPARTO: Record<number, [Zona, number][]> = {
  2: [['cuerpo', 1], ['cuerpo', 4]],
  3: [['cuerpo', 1], ['cuerpo', 3], ['cuerpo', 5]],
  4: [['superior', 1], ['pierna', 2], ['superior', 4], ['pierna', 5]],
  5: [['empuje', 1], ['tiron', 2], ['pierna', 3], ['superior', 5], ['pierna', 6]],
  6: [['empuje', 1], ['tiron', 2], ['pierna', 3], ['empuje', 4], ['tiron', 5], ['pierna', 6]],
};
// Sin gimnasio hay pocos ejercicios de tirón: se reparte por torso, pierna y cuerpo completo.
const REPARTO_SIN_GIMNASIO: Record<number, [Zona, number][]> = {
  ...REPARTO,
  5: [['superior', 1], ['pierna', 2], ['cuerpo', 3], ['superior', 5], ['pierna', 6]],
  6: [['superior', 1], ['pierna', 2], ['cuerpo', 3], ['superior', 4], ['pierna', 5], ['cuerpo', 6]],
};
const NOMBRE_ZONA: Partial<Record<Zona, string>> = { cuerpo: 'Cuerpo completo', superior: 'Torso', pierna: 'Pierna', empuje: 'Empuje', tiron: 'Tirón' };

/** Minutos de cardio al final de cada sesión. */
export function minutosCardio(objetivo: ObjetivoCuerpo, minutos: number) {
  if (objetivo === 'musculo') return 0;
  const m = objetivo === 'perder_peso' ? 20 : 15;
  return minutos <= 30 ? m - 5 : m;
}

// Cardio que se va alternando entre días; sin máquinas, intervalos con el propio cuerpo.
const CARDIO_GIMNASIO = ['cat:running_treadmill', 'cat:bicycling_stationary', 'cat:elliptical_trainer', 'cat:rowing_stationary'];
const CARDIO_SIN_MAQUINAS = ['cat:jumping_jacks', 'cat:escalador'];

export type EjercicioDia = { ejercicio: Ejercicio } & Prescripcion;
export type DiaPrograma = { dia: number; nombre: string; ejercicios: EjercicioDia[] };

export function generarPrograma(c: ConfigPrograma, catalogo: Ejercicio[]): DiaPrograma[] {
  const cardio = minutosCardio(c.objetivo, c.minutos);
  const repeticion = new Map<Zona, number>();
  const reparto = (c.material === 'gimnasio' ? REPARTO : REPARTO_SIN_GIMNASIO)[c.dias];
  return reparto.map(([zona, dia], k) => {
    const r = repeticion.get(zona) ?? 0;
    repeticion.set(zona, r + 1);
    const p: Peticion = {
      zona,
      nivel: c.nivel,
      material: c.material,
      objetivo: 'musculo',
      esfuerzo: c.objetivo === 'definir' ? 'duro' : 'normal',
      minutos: c.minutos - cardio,
    };
    // El mismo grupo repetido en la semana (A, B, C) usa la siguiente mejor opción de cada hueco.
    const usados = new Set<string>();
    const ejercicios: EjercicioDia[] = [];
    sugerirRutina(p, catalogo).huecos.forEach((h, i) => {
      const e = [...h.opciones.slice(r), ...h.opciones].find((o) => !usados.has(o.id));
      if (!e) return; // sin otra opción libre (poco material): mejor un ejercicio menos que repetirlo
      usados.add(e.id);
      ejercicios.push({ ejercicio: e, ...prescripcion(e, i, p) });
    });
    if (cardio) {
      if (c.material === 'gimnasio') {
        const e = EJERCICIO.get(CARDIO_GIMNASIO[k % CARDIO_GIMNASIO.length])!;
        ejercicios.push({ ejercicio: e, series: 1, repsMin: null, repsMax: null, descansoS: 0 });
      } else {
        for (const id of CARDIO_SIN_MAQUINAS) ejercicios.push({ ejercicio: EJERCICIO.get(id)!, series: Math.round(cardio / 4), repsMin: null, repsMax: null, descansoS: 30 });
      }
    }
    const letra = reparto.filter(([z]) => z === zona).length > 1 ? ` ${'ABC'[r]}` : '';
    return { dia, nombre: `${NOMBRE_ZONA[zona]}${letra}`, ejercicios };
  });
}

export function textoCardio(c: Pick<ConfigPrograma, 'objetivo' | 'minutos' | 'material'>) {
  const m = minutosCardio(c.objetivo, c.minutos);
  if (!m) return 'Opcional: 1–2 sesiones de 20–30 min de cardio suave en días libres (andar rápido, bici) ayudan a recuperar.';
  if (c.material === 'gimnasio') return `Al final de cada sesión, ${m} min de cardio a un ritmo en el que puedas hablar con frases cortas.`;
  return `Al final de cada sesión, ${m} min de intervalos: 30 s rápido y 30 s suave alternando los dos ejercicios.`;
}

const DIA_MS = 86_400_000;
const aFecha = (d: Date) => d.toISOString().slice(0, 10);
const deFecha = (s: string) => new Date(`${s}T00:00:00Z`);

/** Lunes de la semana de `hoy`, como AAAA-MM-DD (fechas en UTC para no depender del horario de verano). */
export function lunesDe(hoy: Date): string {
  const d = new Date(Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()));
  return aFecha(new Date(d.getTime() - ((d.getUTCDay() + 6) % 7) * DIA_MS));
}

/** Semana en curso (1…semanas) o null si el programa ya acabó. */
export function semanaActual(inicio: string, semanas: number, hoy: Date): number | null {
  const dias = Math.floor((Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()) - deFecha(inicio).getTime()) / DIA_MS);
  const s = Math.max(1, Math.floor(dias / 7) + 1);
  return s > semanas ? null : s;
}

/** Último día del programa (domingo de la última semana). */
export const finPrevisto = (inicio: string, semanas: number) => aFecha(new Date(deFecha(inicio).getTime() + (semanas * 7 - 1) * DIA_MS));

/** Sesiones que tocaban desde el inicio hasta hoy incluido. */
export function sesionesPrevistas(inicio: string, semanas: number, dias: number[], hoy: Date): number {
  const total = Math.floor((Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()) - deFecha(inicio).getTime()) / DIA_MS) + 1;
  const hasta = Math.min(Math.max(total, 0), semanas * 7);
  let n = Math.floor(hasta / 7) * dias.length;
  for (let i = 0; i < hasta % 7; i++) if (dias.includes(i + 1)) n++;
  return n;
}

export type Pauta = { titulo: string; texto: string; descarga: boolean };

/** Qué hacer cada semana: bloques de 4 (base, acumular, intensificar, descarga). */
export function pautaSemana(semana: number, semanas: number): Pauta {
  if (semana === semanas && semanas > 4)
    return { titulo: 'Última semana', texto: 'Intenta igualar o superar tus mejores marcas y compáralas con las de la semana 1.', descarga: false };
  switch ((semana - 1) % 4) {
    case 0:
      return {
        titulo: semana === 1 ? 'Semana de adaptación' : 'Nuevo bloque',
        texto: 'Elige pesos con los que te sobren 2–3 repeticiones en cada serie y cuida la técnica.',
        descarga: false,
      };
    case 1:
      return { titulo: 'Acumular', texto: 'Con los mismos pesos, intenta hacer 1–2 repeticiones más por serie hasta llegar al máximo del rango.', descarga: false };
    case 2:
      return { titulo: 'Subir el peso', texto: 'En los ejercicios en los que llegaste al máximo de repeticiones, sube el peso un 2,5–5 % y vuelve al mínimo del rango.', descarga: false };
    default:
      return { titulo: 'Descarga', texto: 'Haz la mitad de series con un 10 % menos de peso. Recuperar también es entrenar.', descarga: true };
  }
}
