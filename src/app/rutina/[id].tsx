import { asc, eq, isNull } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router, useLocalSearchParams } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, View } from 'react-native';

import { ElegirEjercicio } from '@/components/elegir-ejercicio';
import { Boton, BotonIcono, Campo, num } from '@/components/ui';
import { C } from '@/constants/theme';
import { db } from '@/db';
import { actualizarObjetivo, anadirARutina, borrarRutina, mover, quitarDeRutina, renombrarRutina } from '@/db/rutina';
import { ejercicio, rutina, rutinaEjercicio, sesion, type Ejercicio, type RutinaEjercicio } from '@/db/schema';
import { empezarSesion } from '@/db/sesion';
import { leerReps } from '@/domain/horario';

export default function EditarRutina() {
  const id = Number(useLocalSearchParams<{ id: string }>().id);
  const { data: rutinas } = useLiveQuery(db.select().from(rutina).where(eq(rutina.id, id)));
  const { data: filas } = useLiveQuery(
    db.select({ obj: rutinaEjercicio, ej: ejercicio }).from(rutinaEjercicio).innerJoin(ejercicio, eq(ejercicio.id, rutinaEjercicio.ejercicioId)).where(eq(rutinaEjercicio.rutinaId, id)).orderBy(asc(rutinaEjercicio.orden)),
  );
  const { data: abiertas } = useLiveQuery(db.select({ id: sesion.id }).from(sesion).where(isNull(sesion.fin)).limit(1));
  const [eligiendo, setEligiendo] = useState(false);
  const r = rutinas[0];
  if (!r) return null;

  const borrar = () =>
    Alert.alert(`¿Borrar ${r.nombre}?`, 'Se quita también del horario. Las sesiones hechas se conservan.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Borrar',
        style: 'destructive',
        onPress: () => {
          router.back();
          borrarRutina(id);
        },
      },
    ]);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
      <Stack.Screen options={{ title: r.nombre }} />
      <Nombre key={r.id} id={id} inicial={r.nombre} />

      {filas.map(({ obj, ej }, i) => (
        <Objetivo key={ej.id} obj={obj} ej={ej} primero={i === 0} ultimo={i === filas.length - 1} />
      ))}
      <Boton texto="Añadir ejercicio" activo={!filas.length} onPress={() => setEligiendo(true)} />

      <View style={{ gap: 8, marginTop: 16 }}>
        {filas.length > 0 && !abiertas.length && (
          <Boton
            texto="Empezar ahora"
            activo
            onPress={() => {
              empezarSesion({ rutina: id });
              router.replace('/');
            }}
          />
        )}
        <Boton texto="Borrar rutina" onPress={borrar} />
      </View>

      <ElegirEjercicio
        visible={eligiendo}
        yaEnSesion={filas.map(({ ej }) => ej.id)}
        onElegir={(ejId) => {
          anadirARutina(id, ejId);
          setEligiendo(false);
        }}
        onCerrar={() => setEligiendo(false)}
      />
    </ScrollView>
  );
}

function Nombre({ id, inicial }: { id: number; inicial: string }) {
  const [nombre, setNombre] = useState(inicial);
  return (
    <TextInput
      value={nombre}
      onChangeText={setNombre}
      onEndEditing={() => (nombre.trim() ? renombrarRutina(id, nombre.trim()) : setNombre(inicial))}
      accessibilityLabel="Nombre de la rutina"
      style={{ minHeight: 48, color: C.texto, fontSize: 24, fontWeight: '700', borderBottomWidth: 1, borderColor: C.borde }}
    />
  );
}

/** Ejercicio de la rutina con su objetivo. Guarda cada campo en cuanto es válido. */
function Objetivo({ obj, ej, primero, ultimo }: { obj: RutinaEjercicio; ej: Ejercicio; primero: boolean; ultimo: boolean }) {
  const conReps = ej.registro === 'carga' || ej.registro === 'peso_corporal';
  const [series, setSeries] = useState(String(obj.series));
  const [reps, setReps] = useState(obj.repsMin ? (obj.repsMin === obj.repsMax || !obj.repsMax ? `${obj.repsMin}` : `${obj.repsMin}-${obj.repsMax}`) : '');
  const [descanso, setDescanso] = useState(String(obj.descansoS));
  const repsOk = leerReps(reps);
  const guardar = (campos: Parameters<typeof actualizarObjetivo>[2]) => actualizarObjetivo(obj.rutinaId, ej.id, campos);
  const entero = (s: string) => {
    const n = num(s);
    return n != null && Number.isInteger(n) && n > 0 ? n : null;
  };

  return (
    <View style={{ backgroundColor: C.tarjeta, borderRadius: 12, padding: 14, gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ flex: 1, color: C.texto, fontSize: 16, fontWeight: '700' }}>{ej.nombre}</Text>
        {!primero && <BotonIcono texto="↑" etiqueta={`Subir ${ej.nombre}`} onPress={() => mover(obj.rutinaId, ej.id, -1)} />}
        {!ultimo && <BotonIcono texto="↓" etiqueta={`Bajar ${ej.nombre}`} onPress={() => mover(obj.rutinaId, ej.id, 1)} />}
        <BotonIcono texto="×" etiqueta={`Quitar ${ej.nombre}`} onPress={() => quitarDeRutina(obj.rutinaId, ej.id)} />
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Campo
          flex
          etiqueta="Series"
          valor={series}
          numerico
          error={!entero(series)}
          onChange={(s) => {
            setSeries(s);
            const n = entero(s);
            if (n) guardar({ series: n });
          }}
        />
        {conReps && (
          <Campo
            flex
            etiqueta="Reps (8-12)"
            valor={reps}
            error={!repsOk}
            onChange={(s) => {
              setReps(s);
              const r = leerReps(s);
              if (r) guardar(r);
            }}
          />
        )}
        <Campo
          flex
          etiqueta="Descanso (s)"
          valor={descanso}
          numerico
          error={!entero(descanso)}
          onChange={(s) => {
            setDescanso(s);
            const n = entero(s);
            if (n) guardar({ descansoS: n });
          }}
        />
      </View>
    </View>
  );
}
