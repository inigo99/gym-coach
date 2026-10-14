import { asc, desc, eq, inArray, isNotNull, isNull } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { Boton, BotonIcono, Seccion } from '@/components/ui';
import { Cronometro, Descanso } from '@/components/cronometros';
import { ElegirEjercicio } from '@/components/elegir-ejercicio';
import { TarjetaEjercicio } from '@/components/tarjeta-ejercicio';
import { C } from '@/constants/theme';
import { db } from '@/db';
import { ejercicio, horario, medicion, rutina, rutinaEjercicio, serie, sesion, sesionEjercicio } from '@/db/schema';
import { anadirEjercicio, borrarSesion, empezarSesion, terminarSesion } from '@/db/sesion';
import { diaDe, textoHora } from '@/domain/horario';
import { reloj, resumen, textoSerie } from '@/domain/sesion';

export default function Entrenar() {
  const { data: abiertas } = useLiveQuery(db.select().from(sesion).where(isNull(sesion.fin)).limit(1));
  const { data: pesos } = useLiveQuery(db.select({ peso: medicion.pesoKg }).from(medicion).orderBy(desc(medicion.fecha), desc(medicion.id)).limit(1));
  const pesoCorporal = pesos[0]?.peso ?? null;
  const abierta = abiertas[0];

  return abierta ? <SesionEnCurso key={abierta.id} id={abierta.id} inicio={abierta.inicio} rutinaId={abierta.rutinaId} pesoCorporal={pesoCorporal} /> : <Historial pesoCorporal={pesoCorporal} />;
}

function SesionEnCurso({ id, inicio, rutinaId, pesoCorporal }: { id: number; inicio: string; rutinaId: number | null; pesoCorporal: number | null }) {
  const { data: ejercicios } = useLiveQuery(
    db.select({ ej: ejercicio }).from(sesionEjercicio).innerJoin(ejercicio, eq(ejercicio.id, sesionEjercicio.ejercicioId)).where(eq(sesionEjercicio.sesionId, id)).orderBy(asc(sesionEjercicio.orden)),
  );
  const { data: series } = useLiveQuery(db.select().from(serie).where(eq(serie.sesionId, id)).orderBy(asc(serie.id)));
  const { data: objetivos } = useLiveQuery(db.select().from(rutinaEjercicio).where(eq(rutinaEjercicio.rutinaId, rutinaId ?? -1)), [rutinaId]);
  const { data: rutinas } = useLiveQuery(db.select({ nombre: rutina.nombre }).from(rutina).where(eq(rutina.id, rutinaId ?? -1)), [rutinaId]);
  const [eligiendo, setEligiendo] = useState(false);
  const [descanso, setDescanso] = useState<{ desde: number; segundos: number } | null>(null);

  const terminar = () => {
    const registro = Object.fromEntries(ejercicios.map(({ ej }) => [ej.id, ej.registro]));
    const r = resumen(series.map((s) => ({ ...s, registro: registro[s.ejercicioId] })), pesoCorporal);
    Alert.alert('¿Terminar la sesión?', series.length ? `${r.series} series · ${Math.round(r.volumenKg)} kg de volumen` : 'No hay series: se descartará.', [
      { text: 'Seguir', style: 'cancel' },
      { text: 'Terminar', onPress: () => terminarSesion(id) },
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: C.borde }}>
        <View>
          <Cronometro desde={Date.parse(inicio)} />
          {rutinas[0] && <Text style={{ color: C.tenue, fontSize: 13 }}>{rutinas[0].nombre}</Text>}
        </View>
        <Pressable onPress={terminar} accessibilityRole="button" style={{ minHeight: 44, paddingHorizontal: 16, justifyContent: 'center', borderRadius: 10, backgroundColor: C.tarjeta }}>
          <Text style={{ color: C.acento, fontWeight: '700' }}>Terminar</Text>
        </Pressable>
      </View>
      {descanso && <Descanso key={descanso.desde} desde={descanso.desde} segundos={descanso.segundos} onCerrar={() => setDescanso(null)} />}

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        {ejercicios.map(({ ej }) => (
          <TarjetaEjercicio
            key={ej.id}
            ejercicio={ej}
            sesionId={id}
            objetivo={objetivos.find((o) => o.ejercicioId === ej.id)}
            series={series.filter((s) => s.ejercicioId === ej.id)}
            onSerie={(segundos) => setDescanso({ desde: Date.now(), segundos })}
          />
        ))}
        <Boton texto="Añadir ejercicio" activo={!ejercicios.length} onPress={() => setEligiendo(true)} />
      </ScrollView>

      <ElegirEjercicio
        visible={eligiendo}
        yaEnSesion={ejercicios.map(({ ej }) => ej.id)}
        onElegir={(ejId) => {
          anadirEjercicio(id, ejId);
          setEligiendo(false);
        }}
        onCerrar={() => setEligiendo(false)}
      />
    </View>
  );
}

function Historial({ pesoCorporal }: { pesoCorporal: number | null }) {
  // ponytail: últimas 30 sesiones; paginar si hace falta ver más atrás (la gráfica de S4 cubre el histórico)
  const { data: sesiones } = useLiveQuery(db.select().from(sesion).where(isNotNull(sesion.fin)).orderBy(desc(sesion.inicio)).limit(30));
  const ids = sesiones.map((s) => s.id);
  const { data: series } = useLiveQuery(
    db.select({ s: serie, nombre: ejercicio.nombre, registro: ejercicio.registro }).from(serie).innerJoin(ejercicio, eq(ejercicio.id, serie.ejercicioId)).where(inArray(serie.sesionId, ids)).orderBy(asc(serie.id)),
    [ids.join()],
  );
  const { data: rutinas } = useLiveQuery(db.select().from(rutina).orderBy(asc(rutina.nombre)));
  const { data: hoy } = useLiveQuery(db.select({ id: rutina.id, nombre: rutina.nombre, hora: horario.hora, minuto: horario.minuto }).from(horario).innerJoin(rutina, eq(rutina.id, horario.rutinaId)).where(eq(horario.dia, diaDe(new Date()))));
  const [abierta, setAbierta] = useState<number | null>(null);
  const toca = hoy[0];

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 24 }}>
      <View style={{ gap: 8 }}>
        {toca && <Boton texto={`Hoy toca: ${toca.nombre} (${textoHora(toca.hora, toca.minuto)})`} activo onPress={() => empezarSesion({ rutina: toca.id })} />}
        {rutinas
          .filter((r) => r.id !== toca?.id)
          .map((r) => (
            <Boton key={r.id} texto={`Empezar ${r.nombre}`} onPress={() => empezarSesion({ rutina: r.id })} />
          ))}
        <Boton texto="Sesión libre" activo={!toca && !rutinas.length} onPress={() => empezarSesion()} />
        {sesiones[0] && <Boton texto="Repetir la última sesión" onPress={() => empezarSesion({ sesion: sesiones[0].id })} />}
      </View>

      <Seccion titulo="Historial">
        {!sesiones.length && <Text style={{ color: C.tenue }}>Aún no hay sesiones.</Text>}
        {sesiones.map((ses) => {
          const suyas = series.filter((x) => x.s.sesionId === ses.id);
          const r = resumen(suyas.map((x) => ({ ...x.s, registro: x.registro })), pesoCorporal);
          const porEjercicio = agrupar(suyas, (x) => x.nombre);
          const fecha = new Date(ses.inicio);
          return (
            <View key={ses.id} style={{ backgroundColor: C.tarjeta, borderRadius: 10 }}>
              <Pressable onPress={() => setAbierta(abierta === ses.id ? null : ses.id)} accessibilityRole="button" accessibilityState={{ expanded: abierta === ses.id }} style={{ padding: 14, gap: 4 }}>
                <Text style={{ color: C.texto, fontSize: 16, fontWeight: '600' }}>
                  {fecha.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}
                </Text>
                <Text style={{ color: C.tenue, fontSize: 13 }}>
                  {reloj((Date.parse(ses.fin!) - fecha.getTime()) / 1000)} · {porEjercicio.size} ejercicios · {r.series} series · {Math.round(r.volumenKg)} kg
                </Text>
              </Pressable>
              {abierta === ses.id && (
                <View style={{ paddingHorizontal: 14, paddingBottom: 6, gap: 8 }}>
                  {[...porEjercicio].map(([nombre, xs]) => (
                    <Text key={nombre} style={{ color: C.texto }}>
                      <Text style={{ fontWeight: '600' }}>{nombre}: </Text>
                      {xs.map((x) => textoSerie({ ...x.s, registro: x.registro })).join(', ')}
                    </Text>
                  ))}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Pressable onPress={() => empezarSesion({ sesion: ses.id })} accessibilityRole="button" style={{ minHeight: 44, justifyContent: 'center' }}>
                      <Text style={{ color: C.acento, fontWeight: '600' }}>Repetir esta sesión</Text>
                    </Pressable>
                    <BotonIcono
                      texto="🗑"
                      etiqueta="Borrar sesión"
                      onPress={() =>
                        Alert.alert('¿Borrar la sesión?', 'No se puede deshacer.', [
                          { text: 'Cancelar', style: 'cancel' },
                          { text: 'Borrar', style: 'destructive', onPress: () => borrarSesion(ses.id) },
                        ])
                      }
                    />
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </Seccion>
    </ScrollView>
  );
}

function agrupar<T>(xs: T[], clave: (x: T) => string) {
  const m = new Map<string, T[]>();
  for (const x of xs) m.set(clave(x), [...(m.get(clave(x)) ?? []), x]);
  return m;
}
