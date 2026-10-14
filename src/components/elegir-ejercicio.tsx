import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, Text, TextInput, View } from 'react-native';

import { buscar } from '@/catalogo';
import { BotonIcono } from '@/components/ui';
import { C } from '@/constants/theme';

/** Selector de ejercicio (variante) con el buscador del catálogo, en español o inglés. */
export function ElegirEjercicio(props: { visible: boolean; yaEnSesion: string[]; onElegir: (id: string) => void; onCerrar: () => void }) {
  const [q, setQ] = useState('');
  const lista = useMemo(
    () => buscar({ texto: q }).flatMap(({ variantes }) => variantes.filter((v) => !props.yaEnSesion.includes(v.id))),
    [q, props.yaEnSesion],
  );

  return (
    <Modal visible={props.visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={props.onCerrar}>
      <View style={{ flex: 1, backgroundColor: C.fondo }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16 }}>
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Buscar en español o inglés"
            placeholderTextColor={C.tenue}
            accessibilityLabel="Buscar ejercicio"
            autoCorrect={false}
            style={{ flex: 1, minHeight: 44, backgroundColor: C.tarjeta, color: C.texto, borderRadius: 10, paddingHorizontal: 12, fontSize: 16 }}
          />
          <BotonIcono texto="×" etiqueta="Cerrar" onPress={props.onCerrar} />
        </View>
        <FlatList
          data={lista}
          keyExtractor={(e) => e.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 8 }}
          renderItem={({ item }) => (
            <Pressable onPress={() => props.onElegir(item.id)} accessibilityRole="button" style={{ backgroundColor: C.tarjeta, borderRadius: 10, padding: 14, minHeight: 44, gap: 2 }}>
              <Text style={{ color: C.texto, fontSize: 16 }}>{item.nombreCompleto}</Text>
              <Text style={{ color: C.tenue, fontSize: 13 }}>{item.en}</Text>
            </Pressable>
          )}
        />
      </View>
    </Modal>
  );
}
