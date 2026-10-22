import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { C } from '@/constants/theme';
import { claveDia, INICIALES, NOMBRE_MES, semanasDelMes } from '@/domain/calendario';

/** Calendario mensual: días con entrenamiento marcados; se elige un día (no futuro). */
export function Calendario(props: { entrenados: Set<string>; seleccionado: string; onElegir: (clave: string) => void }) {
  const hoy = claveDia(new Date());
  const [ref, setRef] = useState(() => {
    const [a, m] = props.seleccionado.split('-').map(Number);
    return { año: a, mes: m - 1 };
  });
  const mover = (paso: number) => setRef(({ año, mes }) => ({ año: año + Math.floor((mes + paso) / 12), mes: (((mes + paso) % 12) + 12) % 12 }));
  const enMes = semanasDelMes(ref.año, ref.mes);
  const n = enMes.flat().filter((d) => d.delMes && props.entrenados.has(d.clave)).length;
  const esteMes = ref.año === new Date().getFullYear() && ref.mes === new Date().getMonth();

  return (
    <View style={{ backgroundColor: C.tarjeta, borderRadius: 12, padding: 10, gap: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Flecha texto="‹" etiqueta="Mes anterior" onPress={() => mover(-1)} />
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ color: C.texto, fontSize: 16, fontWeight: '700' }}>
            {NOMBRE_MES[ref.mes]} {ref.año}
          </Text>
          <Text style={{ color: C.tenue, fontSize: 12 }}>{n === 1 ? '1 día entrenado' : `${n} días entrenados`}</Text>
        </View>
        <Flecha texto="›" etiqueta="Mes siguiente" onPress={() => mover(1)} deshabilitado={esteMes} />
      </View>
      <View style={{ flexDirection: 'row' }}>
        {INICIALES.map((x) => (
          <Text key={x} style={{ flex: 1, textAlign: 'center', color: C.tenue, fontSize: 12, fontWeight: '600' }}>
            {x}
          </Text>
        ))}
      </View>
      {enMes.map((semana) => (
        <View key={semana[0].clave} style={{ flexDirection: 'row' }}>
          {semana.map((d) => {
            const futuro = d.clave > hoy;
            const hecho = props.entrenados.has(d.clave);
            const elegido = d.clave === props.seleccionado;
            return (
              <Pressable
                key={d.clave}
                disabled={futuro}
                onPress={() => props.onElegir(d.clave)}
                accessibilityRole="button"
                accessibilityLabel={`${d.dia} de ${NOMBRE_MES[Number(d.clave.slice(5, 7)) - 1]}${hecho ? ', entrenado' : ''}`}
                accessibilityState={{ selected: elegido, disabled: futuro }}
                style={{ flex: 1, aspectRatio: 1, maxHeight: 48, alignItems: 'center', justifyContent: 'center' }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: hecho ? C.acento : 'transparent',
                    borderWidth: elegido || d.clave === hoy ? 2 : 0,
                    borderColor: elegido ? C.texto : C.acento,
                    opacity: d.delMes ? (futuro ? 0.3 : 1) : 0.35,
                  }}>
                  <Text style={{ color: hecho ? C.fondo : C.texto, fontWeight: hecho ? '700' : '400', fontVariant: ['tabular-nums'] }}>{d.dia}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

function Flecha(props: { texto: string; etiqueta: string; onPress: () => void; deshabilitado?: boolean }) {
  return (
    <Pressable
      onPress={props.onPress}
      disabled={props.deshabilitado}
      accessibilityRole="button"
      accessibilityLabel={props.etiqueta}
      style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', opacity: props.deshabilitado ? 0.3 : 1 }}>
      <Text style={{ color: C.texto, fontSize: 26 }}>{props.texto}</Text>
    </Pressable>
  );
}
