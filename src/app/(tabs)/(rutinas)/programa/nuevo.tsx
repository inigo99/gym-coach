import { router } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { EJERCICIOS } from '@/catalogo';
import { Boton, Chips, Seccion } from '@/components/ui';
import { C } from '@/constants/theme';
import { empezarPrograma } from '@/db/programa';
import { DIAS, textoObjetivo } from '@/domain/horario';
import { DIAS_PROGRAMA, generarPrograma, lunesDe, OBJETIVOS_PROGRAMA, SEMANAS_PROGRAMA, textoCardio, type ObjetivoCuerpo } from '@/domain/programa';
import { MATERIALES, MINUTOS, NIVELES_SUG, nivelDesdePuntos, type MaterialSug, type NivelSug } from '@/domain/sugerencia';
import { useNiveles } from '@/hooks/use-niveles';

const opcionesNum = (xs: readonly number[], sufijo: string) => xs.map((x) => ({ id: String(x), nombre: `${x} ${sufijo}` }));

export default function NuevoPrograma() {
  const { puntos } = useNiveles();
  const [objetivo, setObjetivo] = useState<ObjetivoCuerpo>('musculo');
  const [dias, setDias] = useState('3');
  const [semanas, setSemanas] = useState('8');
  const [nivelElegido, setNivel] = useState<NivelSug | null>(null);
  const [material, setMaterial] = useState<MaterialSug>('gimnasio');
  const [minutos, setMinutos] = useState('60');
  const nivel = nivelElegido ?? nivelDesdePuntos([...puntos.values()].map((p) => p.puntuacion));
  const config = useMemo(() => ({ objetivo, dias: +dias, semanas: +semanas, nivel, material, minutos: +minutos }), [objetivo, dias, semanas, nivel, material, minutos]);
  const plan = useMemo(() => generarPrograma(config, EJERCICIOS), [config]);

  const empezar = () => {
    const hoy = new Date();
    empezarPrograma(config, plan, lunesDe(hoy), hoy.toISOString().slice(0, 10));
    router.replace('/programa');
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 22, paddingBottom: 48 }}>
      <Stack.Screen options={{ title: 'Nuevo programa' }} />
      <Seccion titulo="Qué quieres conseguir">
        {OBJETIVOS_PROGRAMA.map((o) => {
          const activo = o.id === objetivo;
          return (
            <Pressable
              key={o.id}
              onPress={() => setObjetivo(o.id)}
              accessibilityRole="radio"
              accessibilityState={{ checked: activo }}
              style={{ borderRadius: 12, padding: 14, gap: 4, backgroundColor: C.tarjeta, borderWidth: 2, borderColor: activo ? C.acento : C.tarjeta }}>
              <Text style={{ color: activo ? C.acento : C.texto, fontSize: 16, fontWeight: '700' }}>{o.nombre}</Text>
              <Text style={{ color: C.tenue, fontSize: 13 }}>{o.descripcion}</Text>
            </Pressable>
          );
        })}
      </Seccion>
      <Seccion titulo="Días por semana">
        <Chips opciones={opcionesNum(DIAS_PROGRAMA, 'días')} valor={dias} onChange={setDias} />
      </Seccion>
      <Seccion titulo="Duración">
        <Chips opciones={opcionesNum(SEMANAS_PROGRAMA, 'semanas')} valor={semanas} onChange={setSemanas} />
      </Seccion>
      <Seccion titulo="Nivel">
        <Chips opciones={NIVELES_SUG} valor={nivel} onChange={setNivel} />
      </Seccion>
      <Seccion titulo="Material">
        <Chips opciones={MATERIALES} valor={material} onChange={setMaterial} />
      </Seccion>
      <Seccion titulo="Tiempo por sesión">
        <Chips opciones={opcionesNum(MINUTOS, 'min')} valor={minutos} onChange={setMinutos} />
      </Seccion>

      <Seccion titulo="Tu semana">
        {plan.map((d) => (
          <View key={d.dia} style={{ backgroundColor: C.tarjeta, borderRadius: 12, padding: 12, gap: 6 }}>
            <Text style={{ color: C.texto, fontSize: 16, fontWeight: '700' }}>
              {DIAS[d.dia - 1]} · {d.nombre}
            </Text>
            {d.ejercicios.map((e) => (
              <Text key={e.ejercicio.id} style={{ color: C.tenue }}>
                {e.ejercicio.nombreCompleto} <Text style={{ color: C.texto }}>{e.ejercicio.registro === 'cardio' ? '' : textoObjetivo(e)}</Text>
              </Text>
            ))}
          </View>
        ))}
        <Text style={{ color: C.texto, lineHeight: 21 }}>{textoCardio(config)}</Text>
      </Seccion>

      <View style={{ gap: 10 }}>
        <Text style={{ color: C.tenue, fontSize: 13, lineHeight: 19 }}>
          Se crean {plan.length} rutinas nuevas y sustituyen a tu horario semanal (se mantiene la hora de aviso de los días que ya tenías). Si tienes otro programa en marcha, se termina.
        </Text>
        <Boton texto="Empezar programa" activo onPress={empezar} />
      </View>
    </ScrollView>
  );
}
