import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';

import { C } from '@/constants/theme';

type Icono = ComponentProps<typeof Ionicons>['name'];
const icono = (nombre: string) =>
  function TabIcon({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) {
    return <Ionicons name={(focused ? nombre : `${nombre}-outline`) as Icono} size={size} color={color} />;
  };

export default function TabsLayout() {
  return (
    // Cada pestaña tiene su propia pila (con su cabecera); la barra se ve también en las fichas.
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: C.acento, tabBarInactiveTintColor: C.tenue }}>
      <Tabs.Screen name="(entrenar)" options={{ title: 'Entrenar', tabBarIcon: icono('barbell') }} />
      <Tabs.Screen name="(rutinas)" options={{ title: 'Rutinas', tabBarIcon: icono('calendar') }} />
      <Tabs.Screen name="(ejercicios)" options={{ title: 'Ejercicios', tabBarIcon: icono('search') }} />
      <Tabs.Screen name="(progreso)" options={{ title: 'Progreso', tabBarIcon: icono('stats-chart') }} />
      <Tabs.Screen name="(perfil)" options={{ title: 'Perfil', tabBarIcon: icono('person') }} />
    </Tabs>
  );
}
