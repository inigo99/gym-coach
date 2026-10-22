import { FAMILIAS, type Categoria, type Equipo, type Familia, type Tecnica, type Variante } from './datos';

export { CATEGORIAS, EQUIPOS, FAMILIAS } from './datos';
export type { Categoria, Equipo, Familia, Variante } from './datos';

export type Ejercicio = Variante & {
  familia: Familia;
  nombreCompleto: string;
  principales: string[];
  secundarios: string[];
  tecnica: Tecnica;
};

const completar = (f: Familia, v: Variante): Ejercicio => ({
  ...v,
  familia: f,
  nombreCompleto: f.variantes.length === 1 ? f.nombre : `${f.nombre} · ${v.nombre}`,
  principales: v.principales ?? f.principales,
  secundarios: v.secundarios ?? f.secundarios,
  tecnica: {
    ajustes: v.ajustes ?? f.tecnica.ajustes,
    ejecucion: v.ejecucion ?? f.tecnica.ejecucion,
    errores: v.errores ?? f.tecnica.errores,
  },
});

export const EJERCICIOS: Ejercicio[] = FAMILIAS.flatMap((f) => f.variantes.map((v) => completar(f, v)));
export const EJERCICIO = new Map(EJERCICIOS.map((e) => [e.id, e]));

/** Minúsculas y sin tildes, para comparar. */
export const normalizar = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

const textos = (e: Ejercicio) => normalizar([e.familia.nombre, e.familia.en, e.nombre, e.en, ...(e.alias ?? [])].join(' | '));
const INDICE = new Map(EJERCICIOS.map((e) => [e.id, textos(e)]));

export type Filtros = { texto?: string; categoria?: Categoria | null; musculo?: string | null; equipo?: Equipo | null };

/** Familias que tienen alguna variante que cumple los filtros, con esas variantes. Todas las palabras deben aparecer. */
export function buscar({ texto = '', categoria, musculo, equipo }: Filtros) {
  const palabras = normalizar(texto).split(/\s+/).filter(Boolean);
  const out: { familia: Familia; variantes: Ejercicio[] }[] = [];
  for (const f of FAMILIAS) {
    if (categoria && f.categoria !== categoria) continue;
    const vs = EJERCICIOS.filter(
      (e) =>
        e.familia === f &&
        (!musculo || e.principales.includes(musculo) || e.secundarios.includes(musculo)) &&
        (!equipo || e.equipo.includes(equipo)) &&
        palabras.every((p) => INDICE.get(e.id)!.includes(p)),
    );
    if (vs.length) out.push({ familia: f, variantes: vs });
  }
  // Con un músculo elegido, primero los ejercicios en los que es principal (el orden se mantiene dentro de cada grupo).
  if (musculo) out.sort((a, b) => +!a.variantes.some((e) => e.principales.includes(musculo)) - +!b.variantes.some((e) => e.principales.includes(musculo)));
  return out;
}
