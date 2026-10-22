import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { FlatList, Modal, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import musculos from '@/assets/data/musculos.json';
import type { Ejercicio } from '@/catalogo';
import { FiltrosEjercicios, useFiltrosEjercicios } from '@/components/filtros-ejercicios';
import { Ilustracion } from '@/components/ilustracion';
import { BotonIcono } from '@/components/ui';
import { C } from '@/constants/theme';
import type { Marca, SerieMarca } from '@/domain/marcas';
import { textoSerie } from '@/domain/sesion';
import { useMarcas } from '@/hooks/use-marcas';

const NOMBRE_MUSCULO = Object.fromEntries(musculos.map((m) => [m.id, m.nombre]));
const fechaCorta = (iso: string) => new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
const lista = (ms: string[]) => ms.map((x) => NOMBRE_MUSCULO[x]).join(', ');

/**
 * Selector de ejercicio: se elige el ejercicio y, dentro, la variante (máquina, barra, polea…).
 * Busca por nombre de ejercicio o de variante, en español o inglés, con los filtros de la pestaña Ejercicios.
 * Cada variante muestra cómo se hace, qué músculos trabaja y tu última vez y mejor serie.
 */
export function ElegirEjercicio(props: { visible: boolean; yaEnSesion: string[]; onElegir: (id: string) => void; onCerrar: () => void }) {
  const f = useFiltrosEjercicios();
  const marcas = useMarcas();
  const [abierta, setAbierta] = useState<string | null>(null);
  const familias = f.resultados.map((r) => ({ ...r, variantes: r.variantes.filter((v) => !props.yaEnSesion.includes(v.id)) })).filter((r) => r.variantes.length);

  return (
    <Modal visible={props.visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={props.onCerrar}>
      {/* Márgenes seguros: en la app web y en Android la ventana ocupa toda la pantalla. */}
      <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={{ flex: 1, backgroundColor: C.fondo }}>
        <FlatList
          data={familias}
          keyExtractor={(r) => r.familia.id}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          initialNumToRender={8}
          contentContainerStyle={{ paddingBottom: 24, gap: 8 }}
          ListHeaderComponent={
            <FiltrosEjercicios f={f} resumen={familias.length === 1 ? '1 ejercicio' : `${familias.length} ejercicios`} junto={<BotonIcono texto="×" etiqueta="Cerrar" onPress={props.onCerrar} />} />
          }
          ListEmptyComponent={<Text style={{ color: C.tenue, paddingHorizontal: 16 }}>Ningún ejercicio coincide. Prueba con otra palabra o quita algún filtro.</Text>}
          renderItem={({ item: { familia, variantes } }) => {
            // Con una sola variante se añade directamente; si la búsqueda filtra variantes, se abre sola.
            const unica = familia.variantes.length === 1;
            const abiertaAqui = !unica && (abierta === familia.id || (!!f.texto.trim() && variantes.length < familia.variantes.length));
            return (
              <View style={{ marginHorizontal: 16, backgroundColor: C.tarjeta, borderRadius: 12, overflow: 'hidden' }}>
                <Pressable
                  onPress={() => (unica ? props.onElegir(variantes[0].id) : setAbierta(abierta === familia.id ? null : familia.id))}
                  accessibilityRole="button"
                  accessibilityState={unica ? undefined : { expanded: abiertaAqui }}
                  accessibilityLabel={unica ? `Añadir ${familia.nombre}` : `${familia.nombre}, ${variantes.length} variantes`}
                  style={{ padding: 10, flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                  <View style={{ width: 110 }}>
                    <Ilustracion ejercicio={variantes[0]} ancho={110} />
                  </View>
                  <View style={{ flex: 1, gap: 3, minWidth: 0 }}>
                    <Text style={{ color: C.texto, fontSize: 16, fontWeight: '700' }}>{familia.nombre}</Text>
                    <Text style={{ color: C.tenue, fontSize: 12 }}>{familia.en}</Text>
                    <Text style={{ fontSize: 12 }}>
                      <Text style={{ color: C.acento }}>{lista(familia.principales)}</Text>
                      {familia.secundarios.length > 0 && <Text style={{ color: C.tenue }}> · {lista(familia.secundarios)}</Text>}
                    </Text>
                    {unica ? <Marcas m={marcas.get(variantes[0].id)} e={variantes[0]} /> : <Text style={{ color: C.texto, fontSize: 13 }}>{variantes.length === 1 ? '1 variante' : `${variantes.length} variantes`}</Text>}
                  </View>
                  {!unica && <Ionicons name={abiertaAqui ? 'chevron-up' : 'chevron-down'} size={20} color={C.tenue} />}
                </Pressable>
                {abiertaAqui &&
                  variantes.map((v) => (
                    <Pressable
                      key={v.id}
                      onPress={() => props.onElegir(v.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Añadir ${v.nombreCompleto}`}
                      style={{ borderTopWidth: 1, borderColor: C.borde, padding: 10, flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                      <View style={{ width: 110 }}>
                        <Ilustracion ejercicio={v} ancho={110} />
                      </View>
                      <View style={{ flex: 1, gap: 3, minWidth: 0 }}>
                        <Text style={{ color: C.texto, fontSize: 15, fontWeight: '600' }}>{v.nombre}</Text>
                        <Text style={{ color: C.tenue, fontSize: 12 }}>{v.en}</Text>
                        {v.principales.join() !== familia.principales.join() && <Text style={{ color: C.acento, fontSize: 12 }}>{lista(v.principales)}</Text>}
                        <Marcas m={marcas.get(v.id)} e={v} />
                      </View>
                      <Ionicons name="add-circle" size={26} color={C.acento} />
                    </Pressable>
                  ))}
              </View>
            );
          }}
        />
      </SafeAreaView>
    </Modal>
  );
}

function Marcas({ m, e }: { m?: Marca<SerieMarca>; e: Ejercicio }) {
  if (!m) return <Text style={{ color: C.tenue, fontSize: 13 }}>Aún sin registros</Text>;
  const txt = (s: SerieMarca) => textoSerie({ ...s, registro: e.registro });
  return (
    <>
      <Text style={{ color: C.texto, fontSize: 13 }}>
        Última vez: {txt(m.ultima)} <Text style={{ color: C.tenue }}>({fechaCorta(m.fecha)})</Text>
      </Text>
      <Text style={{ color: C.texto, fontSize: 13 }}>Mejor: {txt(m.mejor)}</Text>
    </>
  );
}
