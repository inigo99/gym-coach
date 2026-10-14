import { useState } from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';

import { C } from '@/constants/theme';

const ALTO = 180;
const MARGEN = { izq: 44, der: 12, arriba: 12, abajo: 24 };

/** Gráfica de línea simple: valor por fecha. `formato` da el texto de los ejes y del último valor. */
export function Grafica({ puntos, formato }: { puntos: { fecha: string; valor: number }[]; formato: (v: number) => string }) {
  const [ancho, setAncho] = useState(0);
  if (!puntos.length) {
    return <Text style={{ color: C.tenue, paddingVertical: 24, textAlign: 'center' }}>Sin datos en este periodo.</Text>;
  }

  const xs = puntos.map((p) => Date.parse(p.fecha));
  const ys = puntos.map((p) => p.valor);
  const [x0, x1] = [Math.min(...xs), Math.max(...xs)];
  let [y0, y1] = [Math.min(...ys), Math.max(...ys)];
  const holgura = (y1 - y0) * 0.1 || Math.max(1, y1 * 0.1);
  [y0, y1] = [Math.max(0, y0 - holgura), y1 + holgura];

  const w = ancho - MARGEN.izq - MARGEN.der;
  const h = ALTO - MARGEN.arriba - MARGEN.abajo;
  const px = (x: number) => MARGEN.izq + (x1 === x0 ? w / 2 : ((x - x0) / (x1 - x0)) * w);
  const py = (y: number) => MARGEN.arriba + h - ((y - y0) / (y1 - y0)) * h;
  const fecha = (x: number) => new Date(x).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  const ultimo = puntos.at(-1)!;

  return (
    <View
      onLayout={(e) => setAncho(e.nativeEvent.layout.width)}
      accessible
      accessibilityLabel={`Gráfica de ${puntos.length} sesiones, de ${formato(ys[0])} a ${formato(ultimo.valor)}; máximo ${formato(Math.max(...ys))}`}>
      {ancho > 0 && (
        <Svg width={ancho} height={ALTO}>
          {[y0, (y0 + y1) / 2, y1].map((y) => (
            <Line key={y} x1={MARGEN.izq} x2={ancho - MARGEN.der} y1={py(y)} y2={py(y)} stroke={C.borde} strokeWidth={1} />
          ))}
          {[y0, y1].map((y) => (
            <SvgText key={y} x={MARGEN.izq - 6} y={py(y) + 4} fill={C.tenue} fontSize={11} textAnchor="end">
              {formato(y)}
            </SvgText>
          ))}
          <SvgText x={MARGEN.izq} y={ALTO - 6} fill={C.tenue} fontSize={11}>
            {fecha(x0)}
          </SvgText>
          {x1 !== x0 && (
            <SvgText x={ancho - MARGEN.der} y={ALTO - 6} fill={C.tenue} fontSize={11} textAnchor="end">
              {fecha(x1)}
            </SvgText>
          )}
          <Polyline points={puntos.map((p, i) => `${px(xs[i])},${py(p.valor)}`).join(' ')} fill="none" stroke={C.acento} strokeWidth={2.5} strokeLinejoin="round" />
          {puntos.map((p, i) => (
            <Circle key={i} cx={px(xs[i])} cy={py(p.valor)} r={i === puntos.length - 1 ? 5 : 3} fill={C.acento} />
          ))}
        </Svg>
      )}
    </View>
  );
}
