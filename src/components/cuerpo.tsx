import { Text, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import { C } from '@/constants/theme';

export const SIN_COLOR = '#3A3E44';

// Silueta y zonas en un lienzo de 100 × 210. Las zonas se dibujan en el lado izquierdo y se reflejan.
const SILUETA = [
  'M34 42 Q50 36 66 42 L70 50 L66 100 Q50 106 34 100 L30 50 Z',
  'M30 46 Q22 48 20 60 L16 110 L22 112 L28 66 Z',
  'M70 46 Q78 48 80 60 L84 110 L78 112 L72 66 Z',
  'M36 100 L64 100 L66 120 L60 200 L52 200 L50 128 L48 200 L40 200 L34 120 Z',
];

type Zona = { m: string; d?: string; e?: [number, number, number, number] }; // e = elipse cx, cy, rx, ry

const FRENTE: Zona[] = [
  { m: 'trapecio', d: 'M45 33 L37 39 L46 37 Z' },
  { m: 'hombros', e: [32, 45, 5.5, 6] },
  { m: 'pecho', d: 'M37.5 42 Q44 39 49.3 42 L49.3 55 Q42 58 37.5 53 Z' },
  { m: 'biceps', e: [25.5, 58, 3.3, 8] },
  { m: 'antebrazos', e: [21.5, 84, 2.8, 11] },
  { m: 'abdomen', d: 'M41.5 59 L49.3 59 L49.3 93 L43 91 Q40.5 76 41.5 59 Z' },
  { m: 'abductores', e: [36.5, 102, 2.2, 6] },
  { m: 'cuadriceps', d: 'M37.5 108 Q36.5 126 40 146 L47.5 146 Q49 126 47.5 109 Z' },
  { m: 'aductores', d: 'M47.8 108 L49.6 110 L49.6 130 L48.3 128 Z' },
];

const ESPALDA: Zona[] = [
  { m: 'trapecio', d: 'M49.6 31 L38 40 L44 44 L49.6 58 Z' },
  { m: 'hombros', e: [32, 45, 5.5, 6] },
  { m: 'espalda_media', d: 'M44.5 46 L49.6 59 L49.6 70 L45 64 Z' },
  { m: 'dorsales', d: 'M37.5 50 Q35 64 41 82 L48 74 L44 56 Z' },
  { m: 'lumbar', d: 'M44 77 L49.6 74 L49.6 93 L43 93 Z' },
  { m: 'triceps', e: [25.5, 58, 3.3, 8] },
  { m: 'antebrazos', e: [21.5, 84, 2.8, 11] },
  { m: 'gluteos', e: [43, 104, 6.5, 7.5] },
  { m: 'isquios', d: 'M37.5 114 Q36.5 128 40 146 L47.5 146 Q49 128 48 114 Z' },
  { m: 'gemelos', e: [42.5, 166, 3.6, 11] },
];

function Lado({ zonas, color }: { zonas: Zona[]; color: (m: string) => string }) {
  return zonas.map((z, i) =>
    z.e ? <Ellipse key={i} cx={z.e[0]} cy={z.e[1]} rx={z.e[2]} ry={z.e[3]} fill={color(z.m)} /> : <Path key={i} d={z.d} fill={color(z.m)} />,
  );
}

function Vista({ zonas, color, alto, etiqueta }: { zonas: Zona[]; color: (m: string) => string; alto: number; etiqueta: string }) {
  return (
    <View style={{ alignItems: 'center', gap: 4 }}>
      <Svg viewBox="0 0 100 210" width={(alto * 100) / 210} height={alto}>
        <Circle cx={50} cy={17} r={10} fill={C.borde} />
        <Rect x={45} y={26} width={10} height={9} fill={C.borde} />
        {SILUETA.map((d) => (
          <Path key={d} d={d} fill={C.borde} />
        ))}
        <Rect x={46} y={27} width={8} height={6} fill={color('cuello')} />
        <Lado zonas={zonas} color={color} />
        <G transform="translate(100 0) scale(-1 1)">
          <Lado zonas={zonas} color={color} />
        </G>
      </Svg>
      <Text style={{ color: C.tenue, fontSize: 12 }}>{etiqueta}</Text>
    </View>
  );
}

/** Cuerpo de frente y de espalda con cada grupo muscular coloreado. */
export function Cuerpo({ colores, alto = 220, descripcion }: { colores: Record<string, string>; alto?: number; descripcion: string }) {
  const color = (m: string) => colores[m] ?? SIN_COLOR;
  return (
    <View accessible accessibilityLabel={descripcion} style={{ flexDirection: 'row', justifyContent: 'center', gap: 32 }}>
      <Vista zonas={FRENTE} color={color} alto={alto} etiqueta="Frente" />
      <Vista zonas={ESPALDA} color={color} alto={alto} etiqueta="Espalda" />
    </View>
  );
}

/** Escala de 5 tonos del gris al acento (nivel 1–5 o volumen). */
export const ESCALA = ['#8A4636', '#A64E3A', '#C2563D', '#DC5E3F', '#F56A42'];
export const colorEscala = (t: number) => ESCALA[Math.max(0, Math.min(4, Math.round(t * 4)))];
