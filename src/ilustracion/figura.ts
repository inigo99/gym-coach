/**
 * Ilustración de un ejercicio: figura de perfil (mira a la derecha) en dos posiciones,
 * con el mismo estilo plano que el mapa muscular. Funciones puras: devuelven formas
 * que pinta react-native-svg en la app o un SVG en texto en las vistas previas.
 *
 * Ángulos en grados: 0 = hacia arriba, 90 = hacia delante (derecha), 180 = hacia abajo.
 */

export type Pose = {
  tronco: number; // cadera → hombro
  cabeza?: number; // por defecto, el del tronco
  brazo: [number, number]; // hombro → codo, codo → mano (brazo cercano)
  brazo2?: [number, number]; // brazo lejano (por defecto, igual)
  pierna: [number, number]; // cadera → rodilla, rodilla → tobillo
  pierna2?: [number, number];
  pie?: number; // tobillo → punta (por defecto 90)
  pie2?: number;
  elevado?: number; // altura del punto más bajo sobre el suelo (cajón, colgado…)
  x?: number; // desplazamiento horizontal
  material?: Material[];
};

export type Punto = [number, number];
type Articulacion = 'cadera' | 'hombro' | 'codo' | 'mano' | 'mano2' | 'rodilla' | 'tobillo' | 'tobillo2' | 'cabeza';

export type Material =
  | { t: 'barra' | 'mancuerna' | 'kettlebell' | 'disco' | 'rueda' | 'agarre'; en?: Articulacion }
  | { t: 'barra_fija' | 'paralelas' | 'smith'; en?: Articulacion }
  | { t: 'polea'; en?: Articulacion; ancla: Punto } // ancla relativa a la cadera
  | { t: 'banco'; desde: Articulacion; hasta: Articulacion; inclinado?: boolean }
  | { t: 'asiento'; respaldo?: boolean }
  | { t: 'almohadilla'; en: Articulacion; lado?: 1 | -1 }
  | { t: 'cajon'; x: number; alto: number; ancho?: number } // x relativa a la cadera
  | { t: 'cinta' | 'bici' | 'eliptica' | 'remo' | 'escaladora' | 'esterilla' };

export type Forma =
  | { t: 'capsula'; a: Punto; b: Punto; r: number; c: string; o?: number }
  | { t: 'poligono'; p: Punto[]; c: string; o?: number }
  | { t: 'circulo'; c0: Punto; r: number; c: string; o?: number; borde?: string }
  | { t: 'linea'; a: Punto; b: Punto; c: string; w: number }
  | { t: 'rect'; x: number; y: number; w: number; h: number; c: string; rx?: number };

export const COLORES = {
  cuerpo: '#4A4F57',
  lejos: '#33373D',
  principal: '#F0603C',
  secundario: '#8A4433',
  material: '#8C919A',
  materialOscuro: '#5E636B',
  suelo: '#3A3E44',
};

const L = { tronco: 34, cuello: 5, cabeza: 7.5, brazo: 18, antebrazo: 16, muslo: 24, pierna: 23, pie: 8 };
const R = { tronco: 7.5, brazo: 3.4, antebrazo: 2.8, muslo: 5, pierna: 3.8, cuello: 2.6, pie: 2 };

const rad = (g: number) => (g * Math.PI) / 180;
const dir = (g: number): Punto => [Math.sin(rad(g)), -Math.cos(rad(g))];
const mas = (p: Punto, d: Punto, k = 1): Punto => [p[0] + d[0] * k, p[1] + d[1] * k];

/** Posiciones de las articulaciones con la cadera en (0, 0). */
export function articulaciones(p: Pose) {
  const cadera: Punto = [0, 0];
  const hombro = mas(cadera, dir(p.tronco), L.tronco);
  const cab = p.cabeza ?? p.tronco;
  const cuello = mas(hombro, dir(cab), L.cuello);
  const cabeza = mas(cuello, dir(cab), L.cabeza);
  const b2 = p.brazo2 ?? p.brazo;
  const p2 = p.pierna2 ?? p.pierna;
  const codo = mas(hombro, dir(p.brazo[0]), L.brazo);
  const codo2 = mas(hombro, dir(b2[0]), L.brazo);
  const rodilla = mas(cadera, dir(p.pierna[0]), L.muslo);
  const rodilla2 = mas(cadera, dir(p2[0]), L.muslo);
  const tobillo = mas(rodilla, dir(p.pierna[1]), L.pierna);
  const tobillo2 = mas(rodilla2, dir(p2[1]), L.pierna);
  return {
    cadera, hombro, cuello, cabeza, codo, codo2, rodilla, rodilla2, tobillo, tobillo2,
    mano: mas(codo, dir(p.brazo[1]), L.antebrazo),
    mano2: mas(codo2, dir(b2[1]), L.antebrazo),
    punta: mas(tobillo, dir(p.pie ?? 90), L.pie),
    punta2: mas(tobillo2, dir(p.pie2 ?? p.pie ?? 90), L.pie),
  };
}
type Js = ReturnType<typeof articulaciones>;

/** Mitad de una cápsula (lado delantero +1 o trasero -1), entre las fracciones t0 y t1 del segmento. */
function mitad(a: Punto, b: Punto, r: number, lado: 1 | -1, t0 = 0.08, t1 = 0.92): Punto[] {
  const d: Punto = [b[0] - a[0], b[1] - a[1]];
  const len = Math.hypot(...d);
  const u: Punto = [d[0] / len, d[1] / len];
  // Con el segmento hacia el extremo distal, "delante" queda a la izquierda del sentido de avance.
  const n: Punto = [u[1] * lado, -u[0] * lado];
  const p0 = mas(a, d, t0);
  const p1 = mas(a, d, t1);
  return [p0, p1, mas(p1, n, r * 0.95), mas(p0, n, r * 0.95)];
}

type Colorear = (musculo: string) => string | null;

function cuerpo(j: Js, color: Colorear, lejos: boolean): Forma[] {
  const base = lejos ? COLORES.lejos : COLORES.cuerpo;
  const o = lejos ? 0.55 : 1;
  const f: Forma[] = [];
  const pinta = (m: string, p: Punto[]) => {
    const c = color(m);
    if (c) f.push({ t: 'poligono', p, c, o });
  };
  const brazo = lejos ? { h: j.hombro, c: j.codo2, m: j.mano2 } : { h: j.hombro, c: j.codo, m: j.mano };
  const pierna = lejos ? { r: j.rodilla2, t: j.tobillo2, p: j.punta2 } : { r: j.rodilla, t: j.tobillo, p: j.punta };

  // Pierna
  f.push({ t: 'capsula', a: j.cadera, b: pierna.r, r: R.muslo, c: base });
  f.push({ t: 'capsula', a: pierna.r, b: pierna.t, r: R.pierna, c: base });
  f.push({ t: 'capsula', a: pierna.t, b: pierna.p, r: R.pie, c: base });
  pinta('cuadriceps', mitad(j.cadera, pierna.r, R.muslo, 1, 0.15));
  pinta('isquios', mitad(j.cadera, pierna.r, R.muslo, -1, 0.2));
  pinta('aductores', mitad(j.cadera, pierna.r, R.muslo * 0.4, 1, 0.1, 0.6));
  pinta('gemelos', mitad(pierna.r, pierna.t, R.pierna, -1, 0.1, 0.65));
  if (!lejos) {
    // Tronco, cuello y cabeza (una sola vez, con la pierna cercana)
    f.push({ t: 'capsula', a: j.cadera, b: j.hombro, r: R.tronco, c: COLORES.cuerpo });
    f.push({ t: 'capsula', a: j.hombro, b: j.cuello, r: R.cuello, c: COLORES.cuerpo });
    f.push({ t: 'circulo', c0: j.cabeza, r: L.cabeza, c: COLORES.cuerpo });
    pinta('pecho', mitad(j.hombro, j.cadera, R.tronco, 1, 0.12, 0.45));
    pinta('abdomen', mitad(j.hombro, j.cadera, R.tronco, 1, 0.5, 0.92));
    pinta('trapecio', mitad(j.hombro, j.cadera, R.tronco, -1, 0.0, 0.22));
    pinta('espalda_media', mitad(j.hombro, j.cadera, R.tronco, -1, 0.15, 0.45));
    pinta('dorsales', mitad(j.hombro, j.cadera, R.tronco * 0.8, -1, 0.3, 0.68));
    pinta('lumbar', mitad(j.hombro, j.cadera, R.tronco, -1, 0.68, 0.92));
    pinta('cuello', mitad(j.hombro, j.cuello, R.cuello, -1, 0.0, 1));
    const glu = color('gluteos');
    if (glu) {
      const atras = dir(((Math.atan2(j.hombro[0], -j.hombro[1]) * 180) / Math.PI) - 90);
      f.push({ t: 'circulo', c0: mas(j.cadera, atras, 3.5), r: 5.2, c: glu });
    }
    const abd = color('abductores');
    if (abd) f.push({ t: 'circulo', c0: j.cadera, r: 3, c: abd });
  }
  // Brazo
  f.push({ t: 'capsula', a: brazo.h, b: brazo.c, r: R.brazo, c: base });
  f.push({ t: 'capsula', a: brazo.c, b: brazo.m, r: R.antebrazo, c: base });
  pinta('biceps', mitad(brazo.h, brazo.c, R.brazo, 1, 0.2));
  pinta('triceps', mitad(brazo.h, brazo.c, R.brazo, -1, 0.2));
  pinta('antebrazos', mitad(brazo.c, brazo.m, R.antebrazo, 1, 0.1, 0.8));
  const hom = color('hombros');
  if (hom) f.push({ t: 'circulo', c0: brazo.h, r: 4.6, c: hom, o });
  return f;
}

function material(m: Material, j: Js, suelo: number): Forma[] {
  const M = COLORES.material;
  const D = COLORES.materialOscuro;
  const en = 'en' in m && m.en ? (j as Record<string, Punto>)[m.en] : j.mano;
  switch (m.t) {
    case 'barra':
      return [{ t: 'circulo', c0: en, r: 9, c: D }, { t: 'circulo', c0: en, r: 2.2, c: M }];
    case 'mancuerna':
      return [{ t: 'circulo', c0: en, r: 4.5, c: M }];
    case 'disco':
      return [{ t: 'circulo', c0: en, r: 7.5, c: D, borde: M }];
    case 'rueda':
      return [{ t: 'circulo', c0: [en[0], suelo - 6], r: 6, c: D, borde: M }];
    case 'agarre':
      return [{ t: 'capsula', a: [en[0] - 3, en[1]], b: [en[0] + 3, en[1]], r: 1.6, c: M }];
    case 'kettlebell':
      return [
        { t: 'capsula', a: [en[0] - 2.5, en[1] + 1], b: [en[0] + 2.5, en[1] + 1], r: 1.2, c: M },
        { t: 'circulo', c0: [en[0], en[1] + 7], r: 5.5, c: M },
      ];
    case 'barra_fija':
      return [{ t: 'linea', a: [en[0] - 8, en[1] - 2], b: [en[0] + 8, en[1] - 2], c: D, w: 2 }, { t: 'circulo', c0: en, r: 2.6, c: M }];
    case 'paralelas':
      return [{ t: 'linea', a: [en[0], en[1]], b: [en[0], suelo], c: D, w: 2.5 }, { t: 'circulo', c0: en, r: 2.6, c: M }];
    case 'smith':
      return [
        { t: 'linea', a: [en[0] + 11, suelo], b: [en[0] + 11, en[1] - 45], c: D, w: 2.5 },
        { t: 'circulo', c0: en, r: 2.6, c: M },
        { t: 'linea', a: [en[0] - 4, en[1]], b: [en[0] + 11, en[1]], c: M, w: 2 },
      ];
    case 'polea': {
      const a: Punto = [j.cadera[0] + m.ancla[0], j.cadera[1] + m.ancla[1]];
      return [
        { t: 'linea', a: [a[0], suelo], b: [a[0], Math.min(a[1], j.cabeza[1]) - 12], c: D, w: 3 },
        { t: 'linea', a: en, b: a, c: M, w: 1 },
        { t: 'circulo', c0: a, r: 2.8, c: M },
        { t: 'capsula', a: [en[0], en[1] - 2], b: [en[0], en[1] + 2], r: 1.4, c: M },
      ];
    }
    case 'banco': {
      const a = (j as Record<string, Punto>)[m.desde];
      const b = (j as Record<string, Punto>)[m.hasta];
      if (m.inclinado) {
        // tablero paralelo al tronco, por detrás, y patas al suelo
        const atras = dir(((Math.atan2(b[0] - a[0], -(b[1] - a[1])) * 180) / Math.PI) - 90);
        const p0 = mas(a, atras, R.tronco + 1.5);
        const p1 = mas(b, atras, R.tronco + 1.5);
        return [
          { t: 'linea', a: mas(p0, [p0[0] - p1[0], p0[1] - p1[1]], 0.1), b: p1, c: D, w: 4 },
          { t: 'linea', a: [p0[0], p0[1] + 2], b: [p0[0], suelo], c: D, w: 2 },
          { t: 'linea', a: [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2], b: [(p0[0] + p1[0]) / 2, suelo], c: D, w: 2 },
        ];
      }
      const y = Math.max(a[1], b[1]) + R.tronco + 1;
      const x0 = Math.min(a[0], b[0]) - 4;
      const x1 = Math.max(a[0], b[0]) + 4;
      return [
        { t: 'rect', x: x0, y, w: x1 - x0, h: 4, c: D, rx: 1.5 },
        { t: 'linea', a: [x0 + 4, y + 4], b: [x0 + 4, suelo], c: D, w: 2 },
        { t: 'linea', a: [x1 - 4, y + 4], b: [x1 - 4, suelo], c: D, w: 2 },
      ];
    }
    case 'asiento': {
      const y = j.cadera[1] + R.muslo + 0.5;
      const f: Forma[] = [
        { t: 'rect', x: j.cadera[0] - 9, y, w: 18, h: 4, c: D, rx: 1.5 },
        { t: 'linea', a: [j.cadera[0], y + 4], b: [j.cadera[0], suelo], c: D, w: 2.5 },
      ];
      if (m.respaldo) {
        const atras = dir(((Math.atan2(j.hombro[0], -j.hombro[1]) * 180) / Math.PI) - 90);
        f.push({ t: 'linea', a: mas(j.cadera, atras, R.tronco + 2), b: mas(j.hombro, atras, R.tronco + 2), c: D, w: 4 });
      }
      return f;
    }
    case 'almohadilla': {
      return [{ t: 'circulo', c0: en, r: 3.5, c: D, borde: M }];
    }
    case 'cajon': {
      const w = m.ancho ?? 22;
      return [{ t: 'rect', x: j.cadera[0] + m.x - w / 2, y: suelo - m.alto, w, h: m.alto, c: D, rx: 1.5 }];
    }
    case 'esterilla':
      return [{ t: 'rect', x: j.cadera[0] - 45, y: suelo - 2, w: 90, h: 2, c: D }];
    case 'cinta':
      return [
        { t: 'rect', x: j.cadera[0] - 30, y: suelo - 5, w: 60, h: 5, c: D, rx: 2 },
        { t: 'linea', a: [j.cadera[0] + 30, suelo - 5], b: [j.cadera[0] + 36, j.cadera[1] - 6], c: D, w: 2.5 },
      ];
    case 'bici':
      return [
        { t: 'rect', x: j.cadera[0] - 6, y: j.cadera[1] + R.muslo, w: 12, h: 3, c: D, rx: 1.5 },
        { t: 'linea', a: [j.cadera[0], j.cadera[1] + R.muslo + 3], b: [j.cadera[0] + 8, suelo], c: D, w: 2.5 },
        { t: 'circulo', c0: [j.cadera[0] + 14, suelo - 12], r: 9, c: 'none', borde: D },
        { t: 'linea', a: [j.cadera[0] + 8, suelo], b: [j.mano[0] + 2, j.mano[1] + 2], c: D, w: 2.5 },
      ];
    case 'eliptica':
      return [
        { t: 'rect', x: j.cadera[0] - 20, y: suelo - 4, w: 48, h: 4, c: D, rx: 2 },
        { t: 'linea', a: [j.cadera[0] + 26, suelo - 4], b: [j.mano[0] + 2, j.mano[1]], c: D, w: 2.5 },
      ];
    case 'remo':
      return [
        { t: 'rect', x: j.cadera[0] - 30, y: suelo - 4, w: 80, h: 4, c: D, rx: 2 },
        { t: 'rect', x: j.cadera[0] - 7, y: j.cadera[1] + R.muslo, w: 14, h: 3, c: D, rx: 1.5 },
        { t: 'circulo', c0: [j.cadera[0] + 50, suelo - 9], r: 8, c: D },
        { t: 'linea', a: en, b: [j.cadera[0] + 50, suelo - 9], c: M, w: 1 },
      ];
    case 'escaladora':
      return [
        { t: 'rect', x: j.cadera[0] - 4, y: suelo - 8, w: 14, h: 8, c: D },
        { t: 'rect', x: j.cadera[0] + 10, y: suelo - 16, w: 14, h: 16, c: D },
        { t: 'linea', a: [j.cadera[0] + 24, suelo], b: [j.mano[0] + 2, j.mano[1]], c: D, w: 2.5 },
      ];
  }
}

function puntosCuerpo(j: Js): [Punto, number][] {
  return [
    [j.cabeza, L.cabeza], [j.hombro, R.tronco], [j.cadera, R.tronco], [j.codo, R.brazo], [j.codo2, R.brazo],
    [j.mano, R.antebrazo], [j.mano2, R.antebrazo], [j.rodilla, R.muslo], [j.rodilla2, R.muslo],
    [j.tobillo, R.pierna], [j.tobillo2, R.pierna], [j.punta, R.pie], [j.punta2, R.pie],
  ];
}

/**
 * Formas de una posición, con el suelo en y = 0 y la figura centrada en x = 0.
 * Devuelve también la caja que ocupa, para encuadrar las dos posiciones a la misma escala.
 */
export function dibujarPose(p: Pose, color: Colorear) {
  const j0 = articulaciones(p);
  const bajo = Math.max(...puntosCuerpo(j0).map(([q, r]) => q[1] + r));
  const dy = -bajo - (p.elevado ?? 0);
  const dx = p.x ?? 0;
  const j = Object.fromEntries(Object.entries(j0).map(([k, q]) => [k, [q[0] + dx, q[1] + dy]])) as Js;
  const formas: Forma[] = [
    ...(p.material ?? []).filter((m) => m.t === 'polea' || m.t === 'smith' || m.t === 'cajon' || m.t === 'esterilla').flatMap((m) => material(m, j, 0)),
    ...cuerpo(j, color, true),
    ...(p.material ?? []).filter((m) => m.t === 'banco' || m.t === 'asiento' || m.t === 'cinta' || m.t === 'bici' || m.t === 'eliptica' || m.t === 'remo' || m.t === 'escaladora').flatMap((m) => material(m, j, 0)),
    ...cuerpo(j, color, false),
    ...(p.material ?? []).filter((m) => ['barra', 'mancuerna', 'kettlebell', 'disco', 'rueda', 'agarre', 'barra_fija', 'paralelas', 'almohadilla'].includes(m.t)).flatMap((m) => material(m, j, 0)),
  ];
  return { formas, caja: caja(formas) };
}

function caja(f: Forma[]) {
  const xs: number[] = [];
  const ys: number[] = [];
  const add = (q: Punto, r = 0) => {
    xs.push(q[0] - r, q[0] + r);
    ys.push(q[1] - r, q[1] + r);
  };
  for (const s of f) {
    if (s.t === 'capsula' || s.t === 'linea') {
      add(s.a, 'r' in s ? s.r : 1);
      add(s.b, 'r' in s ? s.r : 1);
    }
    else if (s.t === 'poligono') s.p.forEach((q) => add(q));
    else if (s.t === 'circulo') add(s.c0, s.r);
    else {
      add([s.x, s.y]);
      add([s.x + s.w, s.y + s.h]);
    }
  }
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys, 0), y1: 0 };
}

export const ANCHO = 260;
export const ALTO = 130;

/**
 * Las dos posiciones lado a lado (inicio a la izquierda, final a la derecha),
 * a la misma escala y con el suelo a la misma altura. Coordenadas en un lienzo ANCHO × ALTO.
 */
export function ilustracion(inicio: Pose, final: Pose, musculos: { principales: string[]; secundarios: string[] }) {
  const color: Colorear = (m) => (musculos.principales.includes(m) ? COLORES.principal : musculos.secundarios.includes(m) ? COLORES.secundario : null);
  const a = dibujarPose(inicio, color);
  const b = dibujarPose(final, color);
  const margen = 8;
  const hueco = 20; // espacio central para la flecha
  const anchoMax = Math.max(a.caja.x1 - a.caja.x0, b.caja.x1 - b.caja.x0);
  const altoMax = Math.max(-a.caja.y0, -b.caja.y0);
  const k = Math.min((ANCHO - hueco - 4 * margen) / 2 / anchoMax, (ALTO - 2 * margen - 4) / altoMax);
  const sueloY = ALTO - margen;
  const colocar = (d: typeof a, cx: number): Forma[] => {
    const ox = cx - ((d.caja.x0 + d.caja.x1) / 2) * k;
    const T = (q: Punto): Punto => [ox + q[0] * k, sueloY + q[1] * k];
    return d.formas.map((s) => {
      switch (s.t) {
        case 'capsula':
          return { ...s, a: T(s.a), b: T(s.b), r: s.r * k };
        case 'linea':
          return { ...s, a: T(s.a), b: T(s.b), w: s.w * k };
        case 'poligono':
          return { ...s, p: s.p.map(T) };
        case 'circulo':
          return { ...s, c0: T(s.c0), r: s.r * k };
        case 'rect': {
          const [x, y] = T([s.x, s.y]);
          return { ...s, x, y, w: s.w * k, h: s.h * k, rx: (s.rx ?? 0) * k };
        }
      }
    });
  };
  const c1 = margen + (ANCHO - hueco - 2 * margen) / 4;
  const c2 = ANCHO - c1;
  const suelo: Forma = { t: 'linea', a: [margen, sueloY + 0.75], b: [ANCHO - margen, sueloY + 0.75], c: COLORES.suelo, w: 1.5 };
  const flecha: Forma[] = [
    { t: 'linea', a: [ANCHO / 2 - 6, ALTO / 2], b: [ANCHO / 2 + 5, ALTO / 2], c: COLORES.material, w: 1.6 },
    { t: 'poligono', p: [[ANCHO / 2 + 7, ALTO / 2], [ANCHO / 2 + 2, ALTO / 2 - 3.5], [ANCHO / 2 + 2, ALTO / 2 + 3.5]], c: COLORES.material },
  ];
  return [suelo, ...colocar(a, c1), ...colocar(b, c2), ...flecha];
}

const n = (x: number) => +x.toFixed(2);
/** SVG en texto (vistas previas y galería). */
export function aSvg(formas: Forma[], fondo?: string) {
  const el = formas
    .map((s) => {
      const op = 'o' in s && s.o != null && s.o < 1 ? ` opacity="${s.o}"` : '';
      switch (s.t) {
        case 'capsula':
          return `<line x1="${n(s.a[0])}" y1="${n(s.a[1])}" x2="${n(s.b[0])}" y2="${n(s.b[1])}" stroke="${s.c}" stroke-width="${n(2 * s.r)}" stroke-linecap="round"${op}/>`;
        case 'poligono':
          return `<path d="M${s.p.map((q) => `${n(q[0])} ${n(q[1])}`).join('L')}Z" fill="${s.c}"${op}/>`;
        case 'circulo':
          return `<circle cx="${n(s.c0[0])}" cy="${n(s.c0[1])}" r="${n(s.r)}" fill="${s.c}"${s.borde ? ` stroke="${s.borde}" stroke-width="1.2"` : ''}${op}/>`;
        case 'linea':
          return `<line x1="${n(s.a[0])}" y1="${n(s.a[1])}" x2="${n(s.b[0])}" y2="${n(s.b[1])}" stroke="${s.c}" stroke-width="${n(s.w)}" stroke-linecap="round"/>`;
        case 'rect':
          return `<rect x="${n(s.x)}" y="${n(s.y)}" width="${n(s.w)}" height="${n(s.h)}" rx="${n(s.rx ?? 0)}" fill="${s.c}"/>`;
      }
    })
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ANCHO} ${ALTO}">${fondo ? `<rect width="${ANCHO}" height="${ALTO}" fill="${fondo}"/>` : ''}${el}</svg>`;
}
