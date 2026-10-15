import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, TextInput, useWindowDimensions, View } from 'react-native';

import musculos from '@/assets/data/musculos.json';
import { buscar, CATEGORIAS, EQUIPOS, type Categoria, type Equipo } from '@/catalogo';
import { Ilustracion } from '@/components/ilustracion';
import { C } from '@/constants/theme';

const MUSCULOS = musculos.filter((m) => m.id !== 'cuello');
const NOMBRE_MUSCULO = Object.fromEntries(musculos.map((m) => [m.id, m.nombre]));
const NOMBRE_CATEGORIA = Object.fromEntries(CATEGORIAS.map((c) => [c.id, c.nombre]));
// Material primero, con lo más habitual en un gimnasio al principio.
const ORDEN: Equipo[] = ['maquina', 'polea', 'mancuerna', 'barra', 'peso_corporal', 'polea_doble', 'smith', 'kettlebell', 'barra_z', 'banco', 'cardio', 'barra_fija', 'paralelas', 'cajon', 'disco', 'rueda'];
const MATERIAL = ORDEN.map((id) => EQUIPOS.find((e) => e.id === id)!);

export default function Ejercicios() {
  const [texto, setTexto] = useState('');
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [musculo, setMusculo] = useState<string | null>(null);
  const [equipo, setEquipo] = useState<Equipo | null>(null);
  const resultados = useMemo(() => buscar({ texto, categoria, musculo, equipo }), [texto, categoria, musculo, equipo]);
  const { width } = useWindowDimensions();
  const filtros = [categoria, musculo, equipo].filter(Boolean).length;
  const otros = [categoria, musculo].filter(Boolean).length; // los del panel
  const [panel, setPanel] = useState(false);

  return (
    <FlatList
      data={resultados}
      keyExtractor={(r) => r.familia.id}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={{ paddingBottom: 32, gap: 10 }}
      initialNumToRender={6}
      ListHeaderComponent={
        <View style={{ gap: 12, paddingTop: 12, paddingBottom: 4 }}>
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
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }} keyboardShouldPersistTaps="handled">
            {MATERIAL.map((o) => (
              <Chip key={o.id} texto={o.nombre} activo={equipo === o.id} onPress={() => setEquipo(equipo === o.id ? null : o.id)} />
            ))}
          </ScrollView>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, paddingHorizontal: 16 }}>
            <Pressable
              onPress={() => setPanel(!panel)}
              accessibilityRole="button"
              accessibilityState={{ expanded: panel }}
              style={{ minHeight: 40, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 20, borderWidth: 1, borderColor: panel || otros ? C.acento : C.borde }}>
              <Ionicons name="options-outline" size={16} color={panel || otros ? C.acento : C.texto} />
              <Text style={{ color: panel || otros ? C.acento : C.texto, fontWeight: '600' }}>Filtros{otros ? ` (${otros})` : ''}</Text>
            </Pressable>
            {musculo && <Pastilla texto={NOMBRE_MUSCULO[musculo]} onQuitar={() => setMusculo(null)} />}
            {categoria && <Pastilla texto={NOMBRE_CATEGORIA[categoria]} onQuitar={() => setCategoria(null)} />}
          </View>
          {panel && (
            <View style={{ marginHorizontal: 16, backgroundColor: C.tarjeta, borderRadius: 12, padding: 12, gap: 14 }}>
              <Grupo titulo="Qué entrena" opciones={MUSCULOS} valor={musculo} onChange={setMusculo} />
              <Grupo titulo="Qué hace" opciones={CATEGORIAS} valor={categoria} onChange={setCategoria} />
            </View>
          )}
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

function Chip(props: { texto: string; activo: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={props.onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: props.activo }}
      style={{ minHeight: 40, paddingHorizontal: 14, justifyContent: 'center', borderRadius: 20, backgroundColor: props.activo ? C.acento : C.tarjeta }}>
      <Text style={{ color: props.activo ? C.fondo : C.texto, fontWeight: '600' }}>{props.texto}</Text>
    </Pressable>
  );
}

/** Filtro activo con su botón para quitarlo. */
function Pastilla(props: { texto: string; onQuitar: () => void }) {
  return (
    <Pressable
      onPress={props.onQuitar}
      accessibilityRole="button"
      accessibilityLabel={`Quitar filtro ${props.texto}`}
      style={{ minHeight: 40, paddingLeft: 12, paddingRight: 8, flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 20, backgroundColor: C.tarjeta }}>
      <Text style={{ color: C.texto, fontWeight: '600' }}>{props.texto}</Text>
      <Ionicons name="close" size={16} color={C.tenue} />
    </Pressable>
  );
}

function Grupo<T extends string>(props: { titulo: string; opciones: readonly { id: T; nombre: string }[]; valor: T | null; onChange: (v: T | null) => void }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ color: C.tenue, fontSize: 12, fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase' }}>{props.titulo}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {props.opciones.map((o) => (
          <Chip key={o.id} texto={o.nombre} activo={props.valor === o.id} onPress={() => props.onChange(props.valor === o.id ? null : o.id)} />
        ))}
      </View>
    </View>
  );
}
