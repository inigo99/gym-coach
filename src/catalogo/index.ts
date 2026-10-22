import { FAMILIAS as BASE, type Categoria, type Equipo, type Familia, type Tecnica, type Variante } from './datos';
import { conMatrix } from './matrix';

export { CATEGORIAS, EQUIPOS } from './datos';

/** Catálogo completo: el base más las máquinas de Matrix (matrix.ts). */
export const FAMILIAS: Familia[] = conMatrix(BASE);
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
// Cada nombre por separado, normalizado y con espacios simples: para las coincidencias exactas.
const NOMBRES = new Map(EJERCICIOS.map((e) => [e.id, [e.familia.nombre, e.familia.en, e.nombre, e.en, e.nombreCompleto, ...(e.alias ?? [])].map((n) => normalizar(n).split(/\s+/).join(' '))]));

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
  // Orden: lo que coincide exactamente con un nombre (p. ej. el de la máquina), luego lo que contiene la frase entera, luego el resto.
  // Con un músculo elegido, además, primero donde es principal. El orden del catálogo se mantiene dentro de cada grupo.
  const frase = palabras.join(' ');
  const relevancia = (r: (typeof out)[number]) =>
    (frase && r.variantes.some((e) => NOMBRES.get(e.id)!.includes(frase)) ? 4 : 0) +
    (frase && r.variantes.some((e) => INDICE.get(e.id)!.includes(frase)) ? 2 : 0) +
    (musculo && r.variantes.some((e) => e.principales.includes(musculo)) ? 1 : 0);
  out.sort((a, b) => relevancia(b) - relevancia(a));
  return out;
}
