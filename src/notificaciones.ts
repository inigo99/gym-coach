import * as N from 'expo-notifications';
import { Platform } from 'react-native';

import { diaExpo, textoHora } from '@/domain/horario';

type Tipo = 'horario' | 'descanso';

// Con la app abierta, el descanso ya vibra y se ve en pantalla: solo se muestra el aviso del horario.
N.setNotificationHandler({
  handleNotification: async (n) => {
    const ver = (n.request.content.data as { tipo?: Tipo })?.tipo !== 'descanso';
    return { shouldShowBanner: ver, shouldShowList: ver, shouldPlaySound: ver, shouldSetBadge: false };
  },
});

if (Platform.OS === 'android') N.setNotificationChannelAsync('default', { name: 'Avisos', importance: N.AndroidImportance.HIGH });

export async function pedirPermiso() {
  const { granted, canAskAgain } = await N.getPermissionsAsync();
  return granted || (canAskAgain && (await N.requestPermissionsAsync()).granted);
}

type FilaHorario = { dia: number; hora: number; minuto: number; nombre: string };
let cola = Promise.resolve();

/** Sustituye todos los avisos semanales por los del horario actual (uno por día; iOS admite 64 pendientes). En cola para no duplicar. */
export function reprogramarHorario(filas: FilaHorario[]) {
  cola = cola.catch(() => {}).then(() => reprogramar(filas));
  return cola;
}

async function reprogramar(filas: FilaHorario[]) {
  const pendientes = await N.getAllScheduledNotificationsAsync();
  await Promise.all(pendientes.filter((p) => (p.content.data as { tipo?: Tipo })?.tipo === 'horario').map((p) => N.cancelScheduledNotificationAsync(p.identifier)));
  if (!filas.length || !(await pedirPermiso())) return;
  for (const f of filas) {
    await N.scheduleNotificationAsync({
      content: { title: `Hoy toca: ${f.nombre}`, body: `A las ${textoHora(f.hora, f.minuto)}`, data: { tipo: 'horario' } },
      trigger: { type: N.SchedulableTriggerInputTypes.WEEKLY, weekday: diaExpo(f.dia), hour: f.hora, minute: f.minuto },
    });
  }
}

/** Aviso de fin de descanso por si la app pasa a segundo plano. Devuelve una función que lo cancela. */
export function avisarDescanso(segundos: number) {
  if (segundos < 1) return () => {};
  const id = pedirPermiso().then((ok) =>
    ok
      ? N.scheduleNotificationAsync({
          content: { title: 'Descanso terminado', body: 'A por la siguiente serie', data: { tipo: 'descanso' } },
          trigger: { type: N.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: Math.round(segundos) },
        })
      : null,
  );
  return () => {
    id.then((i) => {
      if (i) N.cancelScheduledNotificationAsync(i);
    });
  };
}
