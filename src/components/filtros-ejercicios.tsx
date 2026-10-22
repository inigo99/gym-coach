import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import musculos from '@/assets/data/musculos.json';
import { buscar, CATEGORIAS, EQUIPOS, type Categoria, type Equipo } from '@/catalogo';
import { C } from '@/constants/theme';

const MUSCULOS = musculos.filter((m) => m.id !== 'cuello');
const NOMBRE_MUSCULO = Object.fromEntries(musculos.map((m) => [m.id, m.nombre]));
const NOMBRE_CATEGORIA = Object.fromEntries(CATEGORIAS.map((c) => [c.id, c.nombre]));
// Material primero, con lo más habitual en un gimnasio al principio.
const ORDEN: Equipo[] = [
  'maquina',
  'polea',
  'mancuerna',
  'barra',
  'peso_corporal',
  'polea_doble',
  'smith',
  'kettlebell',
  'barra_z',
  'banco',
  'cardio',
  'barra_fija',
  'paralelas',
  'cajon',
  'disco',
  'rueda',
];
const MATERIAL = ORDEN.map((id) => EQUIPOS.find((e) => e.id === id)!);

/** Estado del buscador de ejercicios (texto, material, músculo, tipo) y sus resultados por familia. */
export function useFiltrosEjercicios() {
  const [texto, setTexto] = useState('');
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [musculo, setMusculo] = useState<string | null>(null);
  const [equipo, setEquipo] = useState<Equipo | null>(null);
  const [panel, setPanel] = useState(false);
  const resultados = useMemo(() => buscar({ texto, categoria, musculo, equipo }), [texto, categoria, musculo, equipo]);
  const filtros = [categoria, musculo, equipo].filter(Boolean).length;
  const otros = [categoria, musculo].filter(Boolean).length; // los del panel
  return { texto, setTexto, categoria, setCategoria, musculo, setMusculo, equipo, setEquipo, panel, setPanel, resultados, filtros, otros };
}

/** Buscador con el material primero y el panel de filtros (músculo y tipo). Lo usan la pestaña Ejercicios y el selector al añadir ejercicios. */
export function FiltrosEjercicios(props: { f: ReturnType<typeof useFiltrosEjercicios>; resumen: string; junto?: ReactNode }) {
  const { f } = props;
  return (
    <View style={{ gap: 12, paddingTop: 12, paddingBottom: 4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16 }}>
        <TextInput
          value={f.texto}
          onChangeText={f.setTexto}
          placeholder="Buscar en español o inglés"
          placeholderTextColor={C.tenue}
          accessibilityLabel="Buscar ejercicio"
          autoCorrect={false}
          clearButtonMode="while-editing"
          style={{ flex: 1, minHeight: 44, backgroundColor: C.tarjeta, color: C.texto, borderRadius: 10, paddingHorizontal: 12, fontSize: 16 }}
        />
        {props.junto}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }} keyboardShouldPersistTaps="handled">
        {MATERIAL.map((o) => (
          <Chip key={o.id} texto={o.nombre} activo={f.equipo === o.id} onPress={() => f.setEquipo(f.equipo === o.id ? null : o.id)} />
        ))}
      </ScrollView>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, paddingHorizontal: 16 }}>
        <Pressable
          onPress={() => f.setPanel(!f.panel)}
          accessibilityRole="button"
          accessibilityState={{ expanded: f.panel }}
          style={{ minHeight: 40, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 20, borderWidth: 1, borderColor: f.panel || f.otros ? C.acento : C.borde }}>
          <Ionicons name="options-outline" size={16} color={f.panel || f.otros ? C.acento : C.texto} />
          <Text style={{ color: f.panel || f.otros ? C.acento : C.texto, fontWeight: '600' }}>Filtros{f.otros ? ` (${f.otros})` : ''}</Text>
        </Pressable>
        {f.musculo && <Pastilla texto={NOMBRE_MUSCULO[f.musculo]} onQuitar={() => f.setMusculo(null)} />}
        {f.categoria && <Pastilla texto={NOMBRE_CATEGORIA[f.categoria]} onQuitar={() => f.setCategoria(null)} />}
      </View>
      {f.panel && (
        <View style={{ marginHorizontal: 16, backgroundColor: C.tarjeta, borderRadius: 12, padding: 12, gap: 14 }}>
          <Grupo titulo="Qué entrena" opciones={MUSCULOS} valor={f.musculo} onChange={f.setMusculo} />
          <Grupo titulo="Qué hace" opciones={CATEGORIAS} valor={f.categoria} onChange={f.setCategoria} />
        </View>
      )}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 }}>
        <Text style={{ color: C.tenue, fontSize: 13 }}>{props.resumen}</Text>
        {(f.filtros > 0 || f.texto) && (
          <Pressable
            onPress={() => {
              f.setTexto('');
              f.setCategoria(null);
              f.setMusculo(null);
              f.setEquipo(null);
            }}
            accessibilityRole="button"
            style={{ minHeight: 44, justifyContent: 'center' }}>
            <Text style={{ color: C.acento, fontWeight: '600' }}>Quitar filtros</Text>
          </Pressable>
        )}
      </View>
    </View>
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
