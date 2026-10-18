import { Text } from 'react-native';

import { Boton, Seccion } from '@/components/ui';
import { C } from '@/constants/theme';
import { exportar, importar, leerCopia } from '@/db/copia';
import { alerta } from '@/alerta';
import { compartirJson, elegirTexto } from '@/components/archivo';

async function guardar() {
  const c = exportar();
  await compartirJson(`gym-coach-${c.exportado.slice(0, 10)}.json`, JSON.stringify(c), 'Guardar copia de gym-coach');
}

async function restaurar() {
  const texto = await elegirTexto();
  if (texto == null) return;
  let copia;
  try {
    copia = leerCopia(texto);
  } catch (e) {
    alerta('No se puede importar', (e as Error).message);
    return;
  }
  const n = copia.tablas.sesion.length;
  alerta('¿Sustituir todos tus datos?', `La copia del ${new Date(copia.exportado).toLocaleDateString('es-ES')} tiene ${n} ${n === 1 ? 'sesión' : 'sesiones'}. Lo que tienes ahora se borra.`, [
    { text: 'Cancelar', style: 'cancel' },
    {
      text: 'Importar',
      style: 'destructive',
      onPress: () => {
        try {
          importar(copia);
          alerta('Copia importada');
        } catch (e) {
          alerta('No se puede importar', `La copia tiene datos no válidos y no se ha cambiado nada. (${(e as Error).message})`);
        }
      },
    },
  ]);
}

export function CopiaSeguridad() {
  const fallo = (e: unknown) => alerta('Error', (e as Error).message);
  return (
    <Seccion titulo="Copia de seguridad">
      <Text style={{ color: C.tenue, lineHeight: 20 }}>Tus datos solo están en este dispositivo. Guarda una copia (en Archivos, Drive, correo…) para no perderlos al cambiar de móvil.</Text>
      <Boton texto="Exportar copia" activo onPress={() => guardar().catch(fallo)} />
      <Boton texto="Importar copia" onPress={() => restaurar().catch(fallo)} />
    </Seccion>
  );
}
