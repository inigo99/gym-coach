import { useEffect, useState } from 'react';
import { Text, Vibration, View } from 'react-native';

import { BotonIcono } from '@/components/ui';
import { C } from '@/constants/theme';
import { reloj } from '@/domain/sesion';
import { avisarDescanso } from '@/notificaciones';

function useAhora() {
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return ahora;
}

export function Cronometro({ desde }: { desde: number }) {
  const ahora = useAhora();
  return (
    <Text accessibilityLabel="Duración de la sesión" style={{ color: C.texto, fontSize: 28, fontWeight: '700', fontVariant: ['tabular-nums'] }}>
      {reloj((ahora - desde) / 1000)}
    </Text>
  );
}

/** Cuenta atrás del descanso: vibra con la app abierta y avisa con una notificación si está en segundo plano. */
export function Descanso({ desde, segundos, onCerrar }: { desde: number; segundos: number; onCerrar: () => void }) {
  const ahora = useAhora();
  const [duracion, setDuracion] = useState(segundos);
  const quedan = duracion - (ahora - desde) / 1000;

  useEffect(() => {
    const restante = desde + duracion * 1000 - Date.now();
    const t = setTimeout(() => Vibration.vibrate(), restante);
    const cancelarAviso = avisarDescanso(restante / 1000);
    return () => {
      clearTimeout(t);
      cancelarAviso();
    };
  }, [desde, duracion]);

  const fin = quedan <= 0;
  return (
    <View accessibilityLiveRegion="polite" style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, backgroundColor: fin ? C.acento : C.tarjeta }}>
      <Text style={{ flex: 1, color: fin ? C.fondo : C.texto, fontSize: 16, fontWeight: '600', fontVariant: ['tabular-nums'] }}>
        {fin ? '¡A por la siguiente serie!' : `Descanso ${reloj(quedan)}`}
      </Text>
      {!fin && <BotonIcono texto="−15" etiqueta="Quitar 15 segundos" onPress={() => setDuracion((d) => Math.max(15, d - 15))} />}
      {!fin && <BotonIcono texto="+15" etiqueta="Añadir 15 segundos" onPress={() => setDuracion((d) => d + 15)} />}
      <BotonIcono texto="×" etiqueta="Cerrar descanso" onPress={onCerrar} />
    </View>
  );
}
