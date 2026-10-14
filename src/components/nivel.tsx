import { Text, View } from 'react-native';

import { C } from '@/constants/theme';
import { nivel, NIVELES } from '@/domain/nivel';

const CORTO = ['Princ.', 'Novato', 'Interm.', 'Avanz.', 'Élite'];

/** Nivel con barra de 5 tramos; el tramo actual se rellena según el avance hacia el siguiente. */
export function BarraNivel({ puntuacion }: { puntuacion: number }) {
  const n = nivel(puntuacion);
  return (
    <View accessible accessibilityLabel={`Nivel ${n.nombre}`} style={{ gap: 8 }}>
      <Text style={{ color: C.texto, fontSize: 22, fontWeight: '700' }}>{n.nombre}</Text>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {NIVELES.map((_, i) => (
          <View key={i} style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: C.borde, overflow: 'hidden' }}>
            <View style={{ height: 6, width: `${i < n.indice ? 100 : i === n.indice ? 100 * (n.haciaSiguiente ?? 1) : 0}%`, backgroundColor: C.acento }} />
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row' }}>
        {CORTO.map((t, i) => (
          <Text key={t} style={{ flex: 1, fontSize: 10, color: i === n.indice ? C.texto : C.tenue }}>
            {t}
          </Text>
        ))}
      </View>
    </View>
  );
}
