import { useWindowDimensions } from 'react-native';

/** Máximo ancho del contenido en web (ver #root en public/index.html): en pantallas anchas la app va en una columna centrada. */
export const ANCHO_MAX = 720;

/** Ancho disponible para el contenido: el de la ventana, sin pasar del de la columna. */
export function useAnchoContenido() {
  return Math.min(useWindowDimensions().width, ANCHO_MAX);
}
