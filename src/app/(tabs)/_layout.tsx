import { Tabs } from 'expo-router';

import { C } from '@/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: C.acento, tabBarIcon: () => null, tabBarLabelStyle: { fontSize: 14 } }}>
      <Tabs.Screen name="index" options={{ title: 'Entrenar' }} />
      <Tabs.Screen name="rutinas" options={{ title: 'Rutinas' }} />
      <Tabs.Screen name="ejercicios" options={{ title: 'Ejercicios' }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
