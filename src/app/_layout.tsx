import { eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { DarkTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

import { C } from '@/constants/theme';
import { db } from '@/db';
import { horario, rutina } from '@/db/schema';
import { sembrarCatalogo } from '@/db/semilla';
import { reprogramarHorario } from '@/notificaciones';
import migrations from '../../drizzle/migrations';

SplashScreen.preventAutoHideAsync();

const tema = { ...DarkTheme, colors: { ...DarkTheme.colors, background: C.fondo, card: C.fondo, primary: C.acento, text: C.texto, border: C.borde } };

export default function Layout() {
  const { success, error } = useMigrations(db, migrations);

  useEffect(() => {
    if (!success) return;
    sembrarCatalogo();
    SplashScreen.hideAsync();
  }, [success]);

  if (error) {
    SplashScreen.hideAsync();
    return (
      <View style={{ flex: 1, backgroundColor: C.fondo, justifyContent: 'center', padding: 24 }}>
        <Text style={{ color: C.texto }}>Error al preparar la base de datos: {error.message}</Text>
      </View>
    );
  }
  if (!success) return null;

  return (
    <ThemeProvider value={tema}>
      <AvisosHorario />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="rutina/[id]" options={{ title: 'Rutina', headerBackTitle: 'Rutinas' }} />
      </Stack>
    </ThemeProvider>
  );
}

/** Mantiene los avisos semanales sincronizados con el horario (y los nombres de las rutinas). */
function AvisosHorario() {
  const { data } = useLiveQuery(db.select({ dia: horario.dia, hora: horario.hora, minuto: horario.minuto, nombre: rutina.nombre }).from(horario).innerJoin(rutina, eq(rutina.id, horario.rutinaId)));
  const clave = JSON.stringify(data);
  useEffect(() => {
    reprogramarHorario(JSON.parse(clave)).catch((e) => console.warn('No se pudieron programar los avisos', e));
  }, [clave]);
  return null;
}
