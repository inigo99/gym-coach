import { Pressable, Text, TextInput, View } from 'react-native';

import { C } from '@/constants/theme';

export function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 12 }}>
      <Text style={{ color: C.tenue, fontSize: 13, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase' }}>{titulo}</Text>
      {children}
    </View>
  );
}

export function Campo(props: { etiqueta: string; valor: string; onChange: (s: string) => void; numerico?: boolean; error?: boolean; flex?: boolean; placeholder?: string }) {
  return (
    <View style={{ gap: 6, flex: props.flex ? 1 : undefined }}>
      <Text style={{ color: props.error ? C.acento : C.tenue, fontSize: 13 }}>{props.etiqueta}</Text>
      <TextInput
        value={props.valor}
        onChangeText={props.onChange}
        accessibilityLabel={props.etiqueta}
        keyboardType={props.numerico ? 'decimal-pad' : 'default'}
        placeholder={props.placeholder}
        placeholderTextColor={C.tenue}
        style={{ minHeight: 44, backgroundColor: C.tarjeta, color: C.texto, borderRadius: 10, paddingHorizontal: 12, fontSize: 16, borderWidth: 1, borderColor: props.error ? C.acento : C.borde }}
      />
    </View>
  );
}

export function Boton(props: { texto: string; activo?: boolean; onPress: () => void; deshabilitado?: boolean }) {
  return (
    <Pressable
      onPress={props.onPress}
      disabled={props.deshabilitado}
      accessibilityRole="button"
      style={{ minHeight: 44, flexGrow: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, opacity: props.deshabilitado ? 0.4 : 1, backgroundColor: props.activo ? C.acento : C.tarjeta }}>
      <Text style={{ color: props.activo ? C.fondo : C.texto, fontWeight: '700' }}>{props.texto}</Text>
    </Pressable>
  );
}

/** Botón pequeño de icono (×, +, −) con área táctil de 44 pt. */
export function BotonIcono(props: { texto: string; etiqueta: string; onPress: () => void }) {
  return (
    <Pressable onPress={props.onPress} accessibilityRole="button" accessibilityLabel={props.etiqueta} style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: C.tenue, fontSize: 20 }}>{props.texto}</Text>
    </Pressable>
  );
}

export const num = (s: string) => (s.trim() === '' ? null : Number(s.replace(',', '.')));

/** Selector de una opción en forma de pastillas. */
export function Chips<T extends string>(props: { opciones: readonly { id: T; nombre: string }[]; valor: T; onChange: (id: T) => void }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {props.opciones.map((o) => (
        <Pressable
          key={o.id}
          onPress={() => props.onChange(o.id)}
          accessibilityRole="radio"
          accessibilityState={{ checked: props.valor === o.id }}
          style={{ minHeight: 44, paddingHorizontal: 14, justifyContent: 'center', borderRadius: 22, backgroundColor: props.valor === o.id ? C.acento : C.tarjeta }}>
          <Text style={{ color: props.valor === o.id ? C.fondo : C.texto, fontWeight: '600' }}>{o.nombre}</Text>
        </Pressable>
      ))}
    </View>
  );
}
