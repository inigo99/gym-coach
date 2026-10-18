import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/** Guarda un JSON con el menú de compartir del sistema. En web: archivo.web.ts. */
export async function compartirJson(nombre: string, texto: string, titulo: string) {
  const f = new File(Paths.cache, nombre);
  f.write(texto);
  await Sharing.shareAsync(f.uri, { mimeType: 'application/json', dialogTitle: titulo, UTI: 'public.json' });
}

/** Pide un fichero y devuelve su texto (null si se cancela). */
export async function elegirTexto(): Promise<string | null> {
  const r = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'public.json', '*/*'], copyToCacheDirectory: true });
  return r.canceled ? null : new File(r.assets[0].uri).text();
}
