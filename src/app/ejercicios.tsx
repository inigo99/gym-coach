import { asc } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

import musculos from '../../assets/data/musculos.json';
import { C } from '@/constants/theme';
import { db } from '@/db';
import { ejercicio } from '@/db/schema';

const NOMBRE = Object.fromEntries(musculos.map((m) => [m.id, m.nombre]));
const FILTROS = [
  ['todos', 'Todos'],
  ['fuerza', 'Fuerza'],
  ['cardio', 'Cardio'],
] as const;

export default function Ejercicios() {
  const { data } = useLiveQuery(db.select().from(ejercicio).orderBy(asc(ejercicio.nombre)));
  const [filtro, setFiltro] = useState<(typeof FILTROS)[number][0]>('todos');
  const lista = data.filter((e) => filtro === 'todos' || (filtro === 'cardio') === (e.registro === 'cardio'));

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', gap: 8, padding: 16 }}>
        {FILTROS.map(([id, txt]) => (
          <Pressable
            key={id}
            onPress={() => setFiltro(id)}
            accessibilityRole="button"
            accessibilityState={{ selected: filtro === id }}
            style={{ minHeight: 44, paddingHorizontal: 16, justifyContent: 'center', borderRadius: 22, backgroundColor: filtro === id ? C.acento : C.tarjeta }}>
            <Text style={{ color: filtro === id ? C.fondo : C.texto, fontWeight: '600' }}>{txt}</Text>
          </Pressable>
        ))}
      </View>
      <FlatList
        data={lista}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 8 }}
        renderItem={({ item }) => (
          <View style={{ backgroundColor: C.tarjeta, borderRadius: 10, padding: 14, gap: 4 }}>
            <Text style={{ color: C.texto, fontSize: 16, fontWeight: '600' }}>{item.nombre}</Text>
            <Text style={{ color: C.tenue, fontSize: 13 }}>
              {item.musculosPrincipales.map((m) => NOMBRE[m]).join(', ')} · {item.equipo.replace('_', ' ')}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
