import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, TextInput, useWindowDimensions, View } from 'react-native';

import musculos from '@/assets/data/musculos.json';
import { buscar, CATEGORIAS, EQUIPOS, type Categoria, type Equipo } from '@/catalogo';
import { Ilustracion } from '@/components/ilustracion';
import { C } from '@/constants/theme';

const MUSCULOS = musculos.filter((m) => m.id !== 'cuello');
const NOMBRE_MUSCULO = Object.fromEntries(musculos.map((m) => [m.id, m.nombre]));

export default function Ejercicios() {
  const [texto, setTexto] = useState('');
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [musculo, setMusculo] = useState<string | null>(null);
  const [equipo, setEquipo] = useState<Equipo | null>(null);
  const resultados = useMemo(() => buscar({ texto, categoria, musculo, equipo }), [texto, categoria, musculo, equipo]);
  const { width } = useWindowDimensions();
  const filtros = [categoria, musculo, equipo].filter(Boolean).length;

  return (
    <FlatList
      data={resultados}
      keyExtractor={(r) => r.familia.id}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={{ paddingBottom: 32, gap: 10 }}
      initialNumToRender={6}
      ListHeaderComponent={
        <View style={{ gap: 10, paddingTop: 12, paddingBottom: 4 }}>
          <View style={{ paddingHorizontal: 16 }}>
            <TextInput
              value={texto}
              onChangeText={setTexto}
              placeholder="Buscar en español o inglés"
              placeholderTextColor={C.tenue}
              accessibilityLabel="Buscar ejercicio"
              autoCorrect={false}
              clearButtonMode="while-editing"
              style={{ minHeight: 44, backgroundColor: C.tarjeta, color: C.texto, borderRadius: 10, paddingHorizontal: 12, fontSize: 16 }}
            />
          </View>
          <Fila titulo="Qué hace" opciones={CATEGORIAS} valor={categoria} onChange={setCategoria} />
          <Fila titulo="Qué entrena" opciones={MUSCULOS} valor={musculo} onChange={setMusculo} />
          <Fila titulo="Qué usa" opciones={EQUIPOS} valor={equipo} onChange={setEquipo} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 }}>
            <Text style={{ color: C.tenue, fontSize: 13 }}>
              {resultados.length} {resultados.length === 1 ? 'ejercicio' : 'ejercicios'} · {resultados.reduce((n, r) => n + r.variantes.length, 0)} variantes
            </Text>
            {(filtros > 0 || texto) && (
              <Pressable
                onPress={() => {
                  setTexto('');
                  setCategoria(null);
                  setMusculo(null);
                  setEquipo(null);
                }}
                accessibilityRole="button"
                style={{ minHeight: 44, justifyContent: 'center' }}>
                <Text style={{ color: C.acento, fontWeight: '600' }}>Quitar filtros</Text>
              </Pressable>
            )}
          </View>
        </View>
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

function Fila<T extends string>(props: { titulo: string; opciones: readonly { id: T; nombre: string }[]; valor: T | null; onChange: (v: T | null) => void }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: C.tenue, fontSize: 12, fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase', paddingHorizontal: 16 }}>{props.titulo}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }} keyboardShouldPersistTaps="handled">
        {props.opciones.map((o) => {
          const activo = props.valor === o.id;
          return (
            <Pressable
              key={o.id}
              onPress={() => props.onChange(activo ? null : o.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: activo }}
              style={{ minHeight: 40, paddingHorizontal: 14, justifyContent: 'center', borderRadius: 20, backgroundColor: activo ? C.acento : C.tarjeta }}>
              <Text style={{ color: activo ? C.fondo : C.texto, fontWeight: '600' }}>{o.nombre}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
