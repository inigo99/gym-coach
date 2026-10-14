import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert, Text } from 'react-native';

import { Boton, Seccion } from '@/components/ui';
import { C } from '@/constants/theme';
import { exportar, importar, leerCopia } from '@/db/copia';

async function guardar() {
  const c = exportar();
  const f = new File(Paths.cache, `gym-coach-${c.exportado.slice(0, 10)}.json`);
  f.write(JSON.stringify(c));
  await Sharing.shareAsync(f.uri, { mimeType: 'application/json', dialogTitle: 'Guardar copia de gym-coach', UTI: 'public.json' });
}

async function restaurar() {
  const r = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'public.json', '*/*'], copyToCacheDirectory: true });
  if (r.canceled) return;
  let copia;
  try {
    copia = leerCopia(await new File(r.assets[0].uri).text());
  } catch (e) {
    Alert.alert('No se puede importar', (e as Error).message);
    return;
  }
  const n = copia.tablas.sesion.length;
  Alert.alert('¿Sustituir todos tus datos?', `La copia del ${new Date(copia.exportado).toLocaleDateString('es-ES')} tiene ${n} ${n === 1 ? 'sesión' : 'sesiones'}. Lo que tienes ahora se borra.`, [
    { text: 'Cancelar', style: 'cancel' },
    {
      text: 'Importar',
      style: 'destructive',
      onPress: () => {
        try {
          importar(copia);
          Alert.alert('Copia importada');
        } catch (e) {
          Alert.alert('No se puede importar', `La copia tiene datos no válidos y no se ha cambiado nada. (${(e as Error).message})`);
        }
      },
    },
  ]);
}

export function CopiaSeguridad() {
  const fallo = (e: unknown) => Alert.alert('Error', (e as Error).message);
  return (
    <Seccion titulo="Copia de seguridad">
      <Text style={{ color: C.tenue, lineHeight: 20 }}>Tus datos solo están en este móvil. Guarda una copia (en Archivos, Drive, correo…) para no perderlos al cambiar de móvil.</Text>
      <Boton texto="Exportar copia" activo onPress={() => guardar().catch(fallo)} />
      <Boton texto="Importar copia" onPress={() => restaurar().catch(fallo)} />
    </Seccion>
  );
}
