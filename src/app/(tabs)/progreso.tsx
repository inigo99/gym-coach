import { asc, desc, eq, isNotNull, max, sql } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text } from 'react-native';

import musculos from '@/assets/data/musculos.json';
import { Grafica } from '@/components/grafica';
import { Chips, Seccion } from '@/components/ui';
import { C } from '@/constants/theme';
import { db } from '@/db';
import { ejercicio, medicion, serie, sesion } from '@/db/schema';
import { enRango, formatoMetrica, RANGOS } from '@/domain/progreso';

const NOMBRE = Object.fromEntries(musculos.map((m) => [m.id, m.nombre]));

export default function Progreso() {
  const { data: hechos } = useLiveQuery(
    db
      .select({ id: ejercicio.id, nombre: ejercicio.nombre, sesiones: sql<number>`count(distinct ${serie.sesionId})`, ultima: max(sesion.inicio) })
      .from(serie)
      .innerJoin(sesion, eq(sesion.id, serie.sesionId))
      .innerJoin(ejercicio, eq(ejercicio.id, serie.ejercicioId))
      .where(isNotNull(sesion.fin))
      .groupBy(ejercicio.id)
      .orderBy(desc(max(sesion.inicio))),
  );
  const { data: mediciones } = useLiveQuery(db.select().from(medicion).orderBy(asc(medicion.fecha), asc(medicion.id)));
  const { data: todos } = useLiveQuery(db.select({ id: ejercicio.id, nombre: ejercicio.nombre, musculos: ejercicio.musculosPrincipales }).from(ejercicio).orderBy(asc(ejercicio.nombre)));
  const [rango, setRango] = useState<(typeof RANGOS)[number]['id']>('3m');
  const [lista, setLista] = useState<'hechos' | 'todos'>('hechos');
  const puntos = enRango(
    mediciones.map((m) => ({ fecha: m.fecha, valor: m.pesoKg })),
    RANGOS.find((r) => r.id === rango)!.dias,
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 24 }}>
      <Seccion titulo="Peso corporal">
        {mediciones.length ? (
          <>
            <Chips opciones={RANGOS} valor={rango} onChange={setRango} />
            <Grafica puntos={puntos} formato={formatoMetrica('kg')} />
          </>
        ) : (
          <Text style={{ color: C.tenue }}>Añade mediciones en Perfil para ver su evolución.</Text>
        )}
      </Seccion>

      <Seccion titulo="Ejercicios">
        <Chips
          opciones={[
            { id: 'hechos', nombre: 'Hechos' },
            { id: 'todos', nombre: 'Todos' },
          ]}
          valor={lista}
          onChange={setLista}
        />
        {lista === 'hechos' && !hechos.length && <Text style={{ color: C.tenue }}>Termina una sesión para ver tu progreso.</Text>}
        {lista === 'todos' &&
          todos.map((e) => (
            <Pressable key={e.id} onPress={() => router.push({ pathname: '/ejercicio/[id]', params: { id: e.id } })} accessibilityRole="button" style={{ backgroundColor: C.tarjeta, borderRadius: 10, padding: 14, gap: 4 }}>
              <Text style={{ color: C.texto, fontSize: 16, fontWeight: '600' }}>{e.nombre}</Text>
              <Text style={{ color: C.tenue, fontSize: 13 }}>{e.musculos.map((m) => NOMBRE[m]).join(', ')}</Text>
            </Pressable>
          ))}
        {lista === 'hechos' && hechos.map((e) => (
          <Pressable key={e.id} onPress={() => router.push({ pathname: '/ejercicio/[id]', params: { id: e.id } })} accessibilityRole="button" style={{ backgroundColor: C.tarjeta, borderRadius: 10, padding: 14, gap: 4 }}>
            <Text style={{ color: C.texto, fontSize: 16, fontWeight: '600' }}>{e.nombre}</Text>
            <Text style={{ color: C.tenue, fontSize: 13 }}>
              {e.sesiones} {e.sesiones === 1 ? 'sesión' : 'sesiones'} · última el {new Date(e.ultima!).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
            </Text>
          </Pressable>
        ))}
      </Seccion>
    </ScrollView>
  );
}
