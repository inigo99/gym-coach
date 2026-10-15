import { asc, desc, eq, isNotNull, max, sql } from 'drizzle-orm';
import { useLiveQuery } from '@/db/use-live-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text } from 'react-native';

import { Grafica } from '@/components/grafica';
import { RankingCuerpo } from '@/components/ranking-cuerpo';
import { Chips, Seccion } from '@/components/ui';
import { C } from '@/constants/theme';
import { db } from '@/db';
import { ejercicio, medicion, serie, sesion } from '@/db/schema';
import { enRango, formatoMetrica, RANGOS } from '@/domain/progreso';

export default function Progreso() {
  const { data: hechos } = useLiveQuery(
    db
      .select({
        id: ejercicio.id,
        nombre: ejercicio.nombre,
        sesiones: sql<number>`count(distinct ${serie.sesionId})`,
        ultima: max(sesion.inicio),
      })
      .from(serie)
      .innerJoin(sesion, eq(sesion.id, serie.sesionId))
      .innerJoin(ejercicio, eq(ejercicio.id, serie.ejercicioId))
      .where(isNotNull(sesion.fin))
      .groupBy(ejercicio.id)
      .orderBy(desc(max(sesion.inicio))),
  );
  const { data: mediciones } = useLiveQuery(db.select().from(medicion).orderBy(asc(medicion.fecha), asc(medicion.id)));
  const [rango, setRango] = useState<(typeof RANGOS)[number]['id']>('3m');
  const [vista, setVista] = useState<'resumen' | 'cuerpo'>('resumen');
  const puntos = enRango(
    mediciones.map((m) => ({ fecha: m.fecha, valor: m.pesoKg })),
    RANGOS.find((r) => r.id === rango)!.dias,
  );

  const resumen = (
    <>
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

      <Seccion titulo="Ejercicios hechos">
        {!hechos.length && <Text style={{ color: C.tenue }}>Termina una sesión para ver tu progreso. Todos los ejercicios están en la pestaña Ejercicios.</Text>}
        {hechos.map((e) => (
          <Pressable
            key={e.id}
            onPress={() => router.push({ pathname: '/ejercicio/[id]', params: { id: e.id } })}
            accessibilityRole="button"
            style={{
              backgroundColor: C.tarjeta,
              borderRadius: 10,
              padding: 14,
              gap: 4,
            }}
          >
            <Text style={{ color: C.texto, fontSize: 16, fontWeight: '600' }}>{e.nombre}</Text>
            <Text style={{ color: C.tenue, fontSize: 13 }}>
              {e.sesiones} {e.sesiones === 1 ? 'sesión' : 'sesiones'} · última el{' '}
              {new Date(e.ultima!).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
              })}
            </Text>
          </Pressable>
        ))}
      </Seccion>
    </>
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 24, paddingBottom: 40 }}>
      <Chips
        opciones={[
          { id: 'resumen', nombre: 'Peso y ejercicios' },
          { id: 'cuerpo', nombre: 'Cuerpo' },
        ]}
        valor={vista}
        onChange={setVista}
      />
      {vista === 'cuerpo' ? <RankingCuerpo /> : resumen}
    </ScrollView>
  );
}
