import { memo } from 'react';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

import type { Ejercicio } from '@/catalogo';
import { ALTO, ANCHO, ilustracion } from '@/ilustracion/figura';
import { POSES } from '@/ilustracion/poses';

/** Inicio → final del ejercicio, con sus músculos resaltados. */
export const Ilustracion = memo(function Ilustracion({ ejercicio, ancho }: { ejercicio: Ejercicio; ancho: number }) {
  const [a, b] = POSES[ejercicio.pose];
  const formas = ilustracion(a, b, { principales: ejercicio.principales, secundarios: ejercicio.secundarios });
  return (
    <Svg width={ancho} height={(ancho * ALTO) / ANCHO} viewBox={`0 0 ${ANCHO} ${ALTO}`} accessibilityLabel={`${ejercicio.nombreCompleto}: posición inicial y final`}>
      {formas.map((s, i) => {
        const op = 'o' in s ? s.o : undefined;
        switch (s.t) {
          case 'capsula':
            return <Line key={i} x1={s.a[0]} y1={s.a[1]} x2={s.b[0]} y2={s.b[1]} stroke={s.c} strokeWidth={2 * s.r} strokeLinecap="round" opacity={op} />;
          case 'linea':
            return <Line key={i} x1={s.a[0]} y1={s.a[1]} x2={s.b[0]} y2={s.b[1]} stroke={s.c} strokeWidth={s.w} strokeLinecap="round" />;
          case 'poligono':
            return <Path key={i} d={`M${s.p.map((q) => `${q[0]} ${q[1]}`).join('L')}Z`} fill={s.c} opacity={op} />;
          case 'circulo':
            return <Circle key={i} cx={s.c0[0]} cy={s.c0[1]} r={s.r} fill={s.c} stroke={s.borde} strokeWidth={s.borde ? 1.2 : 0} opacity={op} />;
          case 'rect':
            return <Rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx} fill={s.c} />;
        }
      })}
    </Svg>
  );
});
