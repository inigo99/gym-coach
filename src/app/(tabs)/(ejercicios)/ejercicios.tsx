import { router } from 'expo-router';
import { FlatList, Pressable, Text, useWindowDimensions, View } from 'react-native';

import musculos from '@/assets/data/musculos.json';
import { FiltrosEjercicios, useFiltrosEjercicios } from '@/components/filtros-ejercicios';
import { Ilustracion } from '@/components/ilustracion';
import { C } from '@/constants/theme';

const NOMBRE_MUSCULO = Object.fromEntries(musculos.map((m) => [m.id, m.nombre]));

export default function Ejercicios() {
  const f = useFiltrosEjercicios();
  const { resultados } = f;
  const { width } = useWindowDimensions();

  return (
    <FlatList
      data={resultados}
      keyExtractor={(r) => r.familia.id}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={{ paddingBottom: 32, gap: 10 }}
      initialNumToRender={6}
      ListHeaderComponent={
        <FiltrosEjercicios f={f} resumen={`${resultados.length} ${resultados.length === 1 ? 'ejercicio' : 'ejercicios'} · ${resultados.reduce((n, r) => n + r.variantes.length, 0)} variantes`} />
      }
      ListEmptyComponent={<Text style={{ color: C.tenue, paddingHorizontal: 16 }}>Ningún ejercicio coincide. Prueba con otra palabra o quita algún filtro.</Text>}
      renderItem={({ item: { familia, variantes } }) => (
        <Pressable
          onPress={() => router.push({ pathname: '/ejercicio/[id]', params: { id: variantes[0].id } })}
          accessibilityRole="button"
          accessibilityLabel={`${familia.nombre}, ${familia.variantes.length} variantes`}
          style={{ marginHorizontal: 16, backgroundColor: C.tarjeta, borderRadius: 12, padding: 12, gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <Text style={{ color: C.texto, fontSize: 17, fontWeight: '700' }}>{familia.nombre}</Text>
            <Text style={{ color: C.tenue, fontSize: 13 }}>{familia.en}</Text>
          </View>
          <Ilustracion ejercicio={variantes[0]} ancho={width - 56} />
          <Text style={{ color: C.tenue, fontSize: 13 }}>
            {familia.principales.map((m) => NOMBRE_MUSCULO[m]).join(', ')}
            {familia.variantes.length > 1 ? ` · ${familia.variantes.length} variantes` : ''}
          </Text>
          {familia.variantes.length > 1 && (
            <Text style={{ color: C.texto, fontSize: 13 }} numberOfLines={2}>
              {variantes.map((v) => v.nombre).join(' · ')}
            </Text>
          )}
        </Pressable>
      )}
    />
  );
}
