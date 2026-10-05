import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { DarkTheme, Tabs, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

import { C } from '@/constants/theme';
import { db, sembrarCatalogo } from '@/db';
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
      <Tabs screenOptions={{ tabBarActiveTintColor: C.acento, tabBarIcon: () => null, tabBarLabelStyle: { fontSize: 14 } }}>
        <Tabs.Screen name="index" options={{ title: 'Ejercicios' }} />
        <Tabs.Screen name="perfil" options={{ title: 'Perfil' }} />
      </Tabs>
    </ThemeProvider>
  );
}
