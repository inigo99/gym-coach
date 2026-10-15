import { Stack } from 'expo-router/stack';

/** Pila de navegación de una pestaña: las fichas se abren dentro y la barra inferior sigue visible. */
export function Pila({ raiz, titulo }: { raiz: string; titulo: string }) {
  return (
    <Stack screenOptions={{ headerBackTitle: 'Atrás' }}>
      <Stack.Screen name={raiz} options={{ title: titulo }} />
    </Stack>
  );
}
