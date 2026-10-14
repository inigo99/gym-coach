import { and, asc, desc, eq, isNotNull } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useLocalSearchParams } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Grafica } from '@/components/grafica';
import { Chips, Seccion } from '@/components/ui';
import { C } from '@/constants/theme';
import { db } from '@/db';
import { ejercicio, medicion, serie, sesion } from '@/db/schema';
import { enRango, formatoMetrica, METRICAS, RANGOS, record, serieTemporal, type Metrica } from '@/domain/progreso';
import { textoSerie } from '@/domain/sesion';

export default function ProgresoEjercicio() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: ejs } = useLiveQuery(db.select().from(ejercicio).where(eq(ejercicio.id, id)), [id]);
  // ponytail: récords calculados al vuelo desde las series (índice por ejercicio); materializar si va lento con años de datos
  const { data: filas } = useLiveQuery(
    db
      .select({ s: serie, inicio: sesion.inicio })
      .from(serie)
      .innerJoin(sesion, eq(sesion.id, serie.sesionId))
      .where(and(eq(serie.ejercicioId, id), isNotNull(sesion.fin)))
      .orderBy(asc(sesion.inicio), asc(serie.id)),
    [id],
  );
  const { data: mediciones } = useLiveQuery(db.select({ fecha: medicion.fecha, pesoKg: medicion.pesoKg }).from(medicion).orderBy(desc(medicion.fecha)));
  const ej = ejs[0];
  const metricas = ej ? METRICAS[ej.registro] : [];
  const [metrica, setMetrica] = useState<Metrica | null>(null);
  const [rango, setRango] = useState<(typeof RANGOS)[number]['id']>('3m');
  if (!ej) return null;

  const m = metricas.find((x) => x.id === metrica) ?? metricas[0];
  const series = filas.map((f) => ({ ...f.s, inicio: f.inicio }));
  const puntos = serieTemporal(ej.registro, m.id, series, mediciones);
  const sesiones = [...new Set(series.map((s) => s.sesionId))].reverse().slice(0, 10);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 24, paddingBottom: 40 }}>
      <Stack.Screen options={{ title: ej.nombre }} />
      <Seccion titulo="Progresión">
        <Chips opciones={metricas} valor={m.id} onChange={setMetrica} />
        <Chips opciones={RANGOS} valor={rango} onChange={setRango} />
        <Grafica puntos={enRango(puntos, RANGOS.find((r) => r.id === rango)!.dias)} formato={formatoMetrica(m.unidad)} />
      </Seccion>

      <Seccion titulo="Récords">
        {metricas.map((x) => {
          const r = record(serieTemporal(ej.registro, x.id, series, mediciones), x.menorEsMejor);
          return (
            <View key={x.id} style={{ flexDirection: 'row', justifyContent: 'space-between', minHeight: 36, alignItems: 'center', borderBottomWidth: 1, borderColor: C.borde }}>
              <Text style={{ color: C.tenue }}>{x.nombre}</Text>
              <Text style={{ color: C.texto, fontWeight: '600' }}>
                {r ? `${formatoMetrica(x.unidad)(r.valor)} · ${new Date(r.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: '2-digit' })}` : '—'}
              </Text>
            </View>
          );
        })}
      </Seccion>

      <Seccion titulo="Últimas sesiones">
        {sesiones.map((sid) => {
          const ss = series.filter((s) => s.sesionId === sid);
          return (
            <View key={sid} style={{ gap: 2 }}>
              <Text style={{ color: C.tenue, fontSize: 13 }}>{new Date(ss[0].inicio).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</Text>
              <Text style={{ color: C.texto }}>{ss.map((s) => (s.calentamiento ? 'C ' : '') + textoSerie({ ...s, registro: ej.registro })).join(', ')}</Text>
            </View>
          );
        })}
      </Seccion>
    </ScrollView>
  );
}
