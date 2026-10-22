import { FlatList, Modal, Pressable, Text, View } from 'react-native';

import { FiltrosEjercicios, useFiltrosEjercicios } from '@/components/filtros-ejercicios';
import { BotonIcono } from '@/components/ui';
import { C } from '@/constants/theme';

/** Selector de ejercicio (variante): buscador por nombre en español o inglés, con los mismos filtros que la pestaña Ejercicios. */
export function ElegirEjercicio(props: { visible: boolean; yaEnSesion: string[]; onElegir: (id: string) => void; onCerrar: () => void }) {
  const f = useFiltrosEjercicios();
  const lista = f.resultados.flatMap(({ variantes }) => variantes.filter((v) => !props.yaEnSesion.includes(v.id)));

  return (
    <Modal visible={props.visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={props.onCerrar}>
      <View style={{ flex: 1, backgroundColor: C.fondo }}>
        <FlatList
          data={lista}
          keyExtractor={(e) => e.id}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{ paddingBottom: 24, gap: 8 }}
          ListHeaderComponent={
            <FiltrosEjercicios f={f} resumen={lista.length === 1 ? '1 ejercicio' : `${lista.length} ejercicios`} junto={<BotonIcono texto="×" etiqueta="Cerrar" onPress={props.onCerrar} />} />
          }
          ListEmptyComponent={<Text style={{ color: C.tenue, paddingHorizontal: 16 }}>Ningún ejercicio coincide. Prueba con otra palabra o quita algún filtro.</Text>}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => props.onElegir(item.id)}
              accessibilityRole="button"
              style={{ marginHorizontal: 16, backgroundColor: C.tarjeta, borderRadius: 10, padding: 14, minHeight: 44, gap: 2 }}>
              <Text style={{ color: C.texto, fontSize: 16 }}>{item.nombreCompleto}</Text>
              <Text style={{ color: C.tenue, fontSize: 13 }}>{item.en}</Text>
            </Pressable>
          )}
        />
      </View>
    </Modal>
  );
}
