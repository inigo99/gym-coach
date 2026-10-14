import { asc } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useState } from 'react';
import { FlatList, Modal, Pressable, Text, TextInput, View } from 'react-native';

import { BotonIcono } from '@/components/ui';
import { C } from '@/constants/theme';
import { db } from '@/db';
import { ejercicio } from '@/db/schema';

const sinTildes = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

export function ElegirEjercicio(props: { visible: boolean; yaEnSesion: string[]; onElegir: (id: string) => void; onCerrar: () => void }) {
  const { data } = useLiveQuery(db.select().from(ejercicio).orderBy(asc(ejercicio.nombre)));
  const [q, setQ] = useState('');
  const lista = data.filter((e) => !props.yaEnSesion.includes(e.id) && sinTildes(e.nombre).includes(sinTildes(q)));

  return (
    <Modal visible={props.visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={props.onCerrar}>
      <View style={{ flex: 1, backgroundColor: C.fondo }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16 }}>
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Buscar ejercicio"
            placeholderTextColor={C.tenue}
            accessibilityLabel="Buscar ejercicio"
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
            <Pressable onPress={() => props.onElegir(item.id)} accessibilityRole="button" style={{ backgroundColor: C.tarjeta, borderRadius: 10, padding: 14, minHeight: 44 }}>
              <Text style={{ color: C.texto, fontSize: 16 }}>{item.nombre}</Text>
            </Pressable>
          )}
        />
      </View>
    </Modal>
  );
}
