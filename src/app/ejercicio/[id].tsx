import { and, asc, desc, eq, isNotNull } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router, useLocalSearchParams } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { useState } from 'react';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';

import musculos from '@/assets/data/musculos.json';
import { EJERCICIO, EQUIPOS } from '@/catalogo';
import { Cuerpo } from '@/components/cuerpo';
import { Grafica } from '@/components/grafica';
import { Ilustracion } from '@/components/ilustracion';
import { BarraNivel } from '@/components/nivel';
import { Chips, Seccion } from '@/components/ui';
import { C } from '@/constants/theme';
import { db } from '@/db';
import { ejercicio, medicion, serie, sesion } from '@/db/schema';
import { nivel } from '@/domain/nivel';
import { enRango, formatoMetrica, METRICAS, RANGOS, record, serieTemporal, type Metrica } from '@/domain/progreso';
import { textoSerie } from '@/domain/sesion';
import { ESTANDARES, useNiveles } from '@/hooks/use-niveles';

const NOMBRE = Object.fromEntries(musculos.map((m) => [m.id, m.nombre]));
const SECUNDARIO = '#7A3A2C';
const EQUIPO = Object.fromEntries(EQUIPOS.map((e) => [e.id, e.nombre]));

export default function FichaEjercicio() {
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
  const niveles = useNiveles();
  const { width } = useWindowDimensions();
  const ej = ejs[0];
  const cat = EJERCICIO.get(id);
  const metricas = ej ? METRICAS[ej.registro] : [];
  const [metrica, setMetrica] = useState<Metrica | null>(null);
  const [rango, setRango] = useState<(typeof RANGOS)[number]['id']>('3m');
  if (!ej) return null;

  const ficha = cat?.tecnica;
  const familia = cat?.familia;
  const m = metricas.find((x) => x.id === metrica) ?? metricas[0];
  const series = filas.map((f) => ({ ...f.s, inicio: f.inicio }));
  const puntos = serieTemporal(ej.registro, m.id, series, mediciones);
  const sesiones = [...new Set(series.map((s) => s.sesionId))].reverse().slice(0, 10);
  const estandar = ESTANDARES[ej.id];
  const mio = niveles.puntos.get(ej.id);
  const colores = Object.fromEntries([...ej.musculosSecundarios.map((x) => [x, SECUNDARIO]), ...ej.musculosPrincipales.map((x) => [x, C.acento])]);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 28, paddingBottom: 48 }}>
      <Stack.Screen options={{ title: familia?.nombre ?? ej.nombre }} />
      <View style={{ gap: 4 }}>
        {familia && <Text style={{ color: C.tenue }}>{familia.en}</Text>}
        <Text style={{ color: C.tenue }}>{cat ? cat.equipo.map((x) => EQUIPO[x]).join(' · ') : ej.equipo}</Text>
      </View>

      {familia && familia.variantes.length > 1 && (
        <Seccion titulo={`Variantes (${familia.variantes.length})`}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {familia.variantes.map((v) => {
              const activa = v.id === id;
              return (
                <Pressable
                  key={v.id}
                  onPress={() => router.setParams({ id: v.id })}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: activa }}
                  style={{ minHeight: 40, paddingHorizontal: 12, justifyContent: 'center', borderRadius: 20, backgroundColor: activa ? C.acento : C.tarjeta }}>
                  <Text style={{ color: activa ? C.fondo : C.texto, fontWeight: '600' }}>{v.nombre}</Text>
                </Pressable>
              );
            })}
          </View>
        </Seccion>
      )}

      {cat && (
        <Seccion titulo={familia && familia.variantes.length > 1 ? cat.nombre : 'Movimiento'}>
          <Text style={{ color: C.tenue, fontSize: 13 }}>{cat.en}</Text>
          <View style={{ backgroundColor: C.tarjeta, borderRadius: 12, paddingVertical: 4 }}>
            <Ilustracion ejercicio={cat} ancho={width - 32} />
          </View>
          {cat.nota && <Text style={{ color: C.texto, lineHeight: 21 }}>{cat.nota}</Text>}
        </Seccion>
      )}

      <Seccion titulo="Músculos trabajados">
        <Cuerpo colores={colores} descripcion={`Principales: ${ej.musculosPrincipales.map((x) => NOMBRE[x]).join(', ')}`} />
        {[...ej.musculosPrincipales.map((x) => [x, 'Principal', C.acento]), ...ej.musculosSecundarios.map((x) => [x, 'Secundario', SECUNDARIO])].map(([x, tipo, color]) => (
          <View key={x} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: color }} />
            <Text style={{ color: C.texto, flex: 1 }}>{NOMBRE[x]}</Text>
            <Text style={{ color: C.tenue, fontSize: 13 }}>{tipo}</Text>
          </View>
        ))}
      </Seccion>

      {ficha?.ajustes && <Lista titulo="Ajustes" items={ficha.ajustes} numerada />}
      {ficha && <Lista titulo="Ejecución" items={ficha.ejecucion} numerada />}
      {ficha && <Lista titulo="Errores comunes" items={ficha.errores} />}

      {estandar && (
        <Seccion titulo="Tu nivel">
          {niveles.falta ? (
            <Text style={{ color: C.tenue }}>Indica {niveles.falta === 'sexo' ? 'tu sexo' : 'tu peso'} en Perfil para ver tu nivel.</Text>
          ) : mio ? (
            <>
              <BarraNivel puntuacion={mio.puntuacion} />
              <Text style={{ color: C.tenue, fontSize: 13 }}>
                Mejor marca de las últimas {niveles.semanas} semanas:{' '}
                {estandar.tipo === 'ratio' ? `1RM estimado = ${mio.marca.toFixed(2).replace('.', ',')} × tu peso` : `≈ ${Math.floor(mio.marca)} repeticiones sin lastre`}
                {ej.equipo === 'mancuerna' ? ' (peso de una mancuerna)' : ''}.
                {nivel(mio.puntuacion).haciaSiguiente != null && ` ${Math.round(nivel(mio.puntuacion).haciaSiguiente! * 100)} % hacia el siguiente nivel.`}
              </Text>
            </>
          ) : (
            <Text style={{ color: C.tenue }}>Sin series de trabajo en las últimas {niveles.semanas} semanas.</Text>
          )}
          <Text style={{ color: C.tenue, fontSize: 12 }}>Comparado con los estándares de Strength Level.</Text>
        </Seccion>
      )}

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

      {sesiones.length > 0 && (
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
      )}

      <Text style={{ color: C.tenue, fontSize: 12, lineHeight: 18 }}>Información orientativa. No sustituye a un entrenador ni a un profesional sanitario.</Text>
    </ScrollView>
  );
}

function Lista({ titulo, items, numerada }: { titulo: string; items: string[]; numerada?: boolean }) {
  return (
    <Seccion titulo={titulo}>
      {items.map((t, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 12 }}>
          <Text style={{ width: 22, color: numerada ? C.texto : C.acento, fontWeight: '700', textAlign: 'center' }}>{numerada ? i + 1 : '×'}</Text>
          <Text style={{ flex: 1, color: C.texto, fontSize: 15, lineHeight: 22 }}>{t}</Text>
        </View>
      ))}
    </Seccion>
  );
}
