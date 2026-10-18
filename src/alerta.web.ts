import type { AlertButton } from 'react-native';

/** Como Alert.alert, con los diálogos del navegador: con botones, pide confirmación y ejecuta el último que no sea "cancelar". */
export function alerta(titulo: string, mensaje?: string, botones?: AlertButton[]) {
  const texto = mensaje ? `${titulo}\n\n${mensaje}` : titulo;
  const accion = botones?.filter((b) => b.style !== 'cancel').at(-1);
  if (!accion) {
    window.alert(texto);
    botones?.[0]?.onPress?.();
    return;
  }
  if (window.confirm(texto)) accion.onPress?.();
}
