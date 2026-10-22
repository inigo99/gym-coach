import { asc, eq } from 'drizzle-orm';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { useEffect, useState } from 'react';
import { ScrollView, Text } from 'react-native';

import { alerta } from '@/alerta';
import { ElegirEjercicio } from '@/components/elegir-ejercicio';
import { TarjetaEjercicio } from '@/components/tarjeta-ejercicio';
import { Boton } from '@/components/ui';
import { C } from '@/constants/theme';
import { db } from '@/db';
import { ejercicio, rutina, rutinaEjercicio, serie, sesion, sesionEjercicio } from '@/db/schema';
import { anadirEjercicio, borrarSesion, descartarSiVacia } from '@/db/sesion';
import { useLiveQuery } from '@/db/use-live-query';
import { mayuscula } from '@/domain/calendario';

/** Editar una sesión ya hecha o apuntada a mano: ejercicios y series. Cuenta en gráficas y récords como cualquier otra. */
export default function EditarSesion() {
  const id = Number(useLocalSearchParams<{ id: string }>().id);
  const { data: sesiones } = useLiveQuery(db.select().from(sesion).where(eq(sesion.id, id)), [id]);
  const s = sesiones[0];
  const { data: ejercicios } = useLiveQuery(
    db.select({ ej: ejercicio }).from(sesionEjercicio).innerJoin(ejercicio, eq(ejercicio.id, sesionEjercicio.ejercicioId)).where(eq(sesionEjercicio.sesionId, id)).orderBy(asc(sesionEjercicio.orden)),
    [id],
  );
  const { data: series } = useLiveQuery(db.select().from(serie).where(eq(serie.sesionId, id)).orderBy(asc(serie.id)), [id]);
  const { data: objetivos } = useLiveQuery(db.select().from(rutinaEjercicio).where(eq(rutinaEjercicio.rutinaId, s?.rutinaId ?? -1)), [s?.rutinaId]);
  const { data: rutinas } = useLiveQuery(db.select({ nombre: rutina.nombre }).from(rutina).where(eq(rutina.id, s?.rutinaId ?? -1)), [s?.rutinaId]);
  const [eligiendo, setEligiendo] = useState(false);

  // Al salir de la pantalla, si se ha quedado sin series, no se guarda una sesión vacía.
  const navegacion = useNavigation();
  useEffect(() => navegacion.addListener('beforeRemove', () => descartarSiVacia(id)), [navegacion, id]);

  if (!s) return null;
  const fecha = new Date(s.inicio).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
      <Stack.Screen options={{ title: 'Editar entrenamiento' }} />
      <Text style={{ color: C.texto, fontSize: 18, fontWeight: '700' }}>{mayuscula(fecha)}</Text>
      {rutinas[0] && <Text style={{ color: C.tenue }}>{rutinas[0].nombre}</Text>}
      {!ejercicios.length && <Text style={{ color: C.tenue }}>Añade los ejercicios que hiciste y sus series. Se guarda al momento.</Text>}

      {ejercicios.map(({ ej }) => (
        <TarjetaEjercicio key={ej.id} ejercicio={ej} sesionId={id} objetivo={objetivos.find((o) => o.ejercicioId === ej.id)} series={series.filter((x) => x.ejercicioId === ej.id)} onSerie={() => {}} />
      ))}
      <Boton texto="Añadir ejercicio" activo={!ejercicios.length} onPress={() => setEligiendo(true)} />
      {series.length > 0 && <Boton texto="Hecho" activo onPress={() => router.back()} />}
      <Boton
        texto="Borrar entrenamiento"
        onPress={() =>
          alerta('¿Borrar este entrenamiento?', 'No se puede deshacer.', [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Borrar',
              style: 'destructive',
              onPress: () => {
                router.back();
                borrarSesion(id);
              },
            },
          ])
        }
      />

      <ElegirEjercicio
        visible={eligiendo}
        yaEnSesion={ejercicios.map(({ ej }) => ej.id)}
        onElegir={(ejId) => {
          anadirEjercicio(id, ejId);
          setEligiendo(false);
        }}
        onCerrar={() => setEligiendo(false)}
      />
    </ScrollView>
  );
}
