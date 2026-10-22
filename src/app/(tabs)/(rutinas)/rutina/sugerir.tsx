import { router } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import musculos from '@/assets/data/musculos.json';
import { EJERCICIOS } from '@/catalogo';
import { Ilustracion } from '@/components/ilustracion';
import { Boton, Chips, Seccion } from '@/components/ui';
import { C } from '@/constants/theme';
import { guardarRutinaCompleta } from '@/db/rutina';
import {
  duracion, ESFUERZOS, MATERIALES, MINUTOS, NIVELES_SUG, nivelDesdePuntos, OBJETIVOS, prescripcion, sugerirRutina, ZONAS,
  type Esfuerzo, type MaterialSug, type NivelSug, type Objetivo, type Zona,
} from '@/domain/sugerencia';
import { useNiveles } from '@/hooks/use-niveles';
import { useAnchoContenido } from '@/hooks/use-ancho';

const NOMBRE_MUSCULO = Object.fromEntries(musculos.map((m) => [m.id, m.nombre]));
const TIEMPOS = MINUTOS.map((m) => ({ id: String(m), nombre: `${m} min` }));
const descanso = (s: number) => (s >= 60 ? `${+(s / 60).toFixed(1)} min` : `${s} s`);

export default function SugerirRutina() {
  const { puntos } = useNiveles();
  const calculado = nivelDesdePuntos([...puntos.values()].map((p) => p.puntuacion));
  const [zona, setZona] = useState<Zona>('cuerpo');
  const [objetivo, setObjetivo] = useState<Objetivo>('musculo');
  const [nivelElegido, setNivel] = useState<NivelSug | null>(null);
  const [material, setMaterial] = useState<MaterialSug>('gimnasio');
  const [minutos, setMinutos] = useState('60');
  const [esfuerzo, setEsfuerzo] = useState<Esfuerzo>('normal');
  const nivel = nivelElegido ?? calculado;
  const peticion = useMemo(() => ({ zona, objetivo, nivel, material, minutos: +minutos, esfuerzo }), [zona, objetivo, nivel, material, minutos, esfuerzo]);
  const sug = useMemo(() => sugerirRutina(peticion, EJERCICIOS), [peticion]);

  // Opción elegida en cada hueco ("Cambiar" pasa a la siguiente); se reinicia al cambiar la petición.
  const [eleccion, setEleccion] = useState<{ de: typeof peticion; i: number[] }>({ de: peticion, i: [] });
  const indices = eleccion.de === peticion ? eleccion.i : [];
  const elegidos = sug.huecos.map((h, k) => h.opciones[(indices[k] ?? 0) % h.opciones.length]);
  const pres = elegidos.map((e, k) => prescripcion(e, k, peticion));
  const [nombre, setNombre] = useState<string | null>(null);
  const width = useAnchoContenido();

  const cambiar = (k: number) => {
    const i = [...indices];
    i[k] = (i[k] ?? 0) + 1;
    setEleccion({ de: peticion, i });
  };
  const guardar = () => {
    const id = guardarRutinaCompleta(
      (nombre ?? sug.nombre).trim() || sug.nombre,
      elegidos.map((e, k) => ({ ejercicioId: e.id, ...pres[k] })),
    );
    router.replace(`/rutina/${id}`);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 22, paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: 'Sugerir rutina' }} />
      <Seccion titulo="Qué quieres entrenar">
        <Chips opciones={ZONAS} valor={zona} onChange={setZona} />
      </Seccion>
      <Seccion titulo="Objetivo">
        <Chips opciones={OBJETIVOS} valor={objetivo} onChange={setObjetivo} />
      </Seccion>
      <Seccion titulo="Nivel">
        <Chips opciones={NIVELES_SUG} valor={nivel} onChange={setNivel} />
        {!nivelElegido && (
          <Text style={{ color: C.tenue, fontSize: 13 }}>
            {puntos.size ? 'Calculado con tus marcas de las últimas semanas.' : 'Sin marcas registradas todavía: empieza por principiante y súbelo cuando lo veas fácil.'}
          </Text>
        )}
      </Seccion>
      <Seccion titulo="Material">
        <Chips opciones={MATERIALES} valor={material} onChange={setMaterial} />
      </Seccion>
      <Seccion titulo="Tiempo">
        <Chips opciones={TIEMPOS} valor={minutos} onChange={setMinutos} />
      </Seccion>
      <Seccion titulo="Esfuerzo">
        <Chips opciones={ESFUERZOS} valor={esfuerzo} onChange={setEsfuerzo} />
      </Seccion>

      <Seccion titulo={`Tu rutina · ${elegidos.length} ejercicios · unos ${duracion(pres)} min`}>
        {sug.aviso && <Text style={{ color: C.acento }}>{sug.aviso}</Text>}
        {elegidos.map((e, k) => {
          const x = pres[k];
          const opciones = sug.huecos[k].opciones.length;
          return (
            <View key={k} style={{ backgroundColor: C.tarjeta, borderRadius: 12, padding: 12, gap: 6 }}>
              <Pressable onPress={() => router.push({ pathname: '/ejercicio/[id]', params: { id: e.id } })} accessibilityRole="link" accessibilityHint="Ver técnica" style={{ gap: 4 }}>
                <Text style={{ color: C.tenue, fontSize: 12, fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase' }}>
                  {k + 1} · {NOMBRE_MUSCULO[sug.huecos[k].musculo]}
                </Text>
                <Text style={{ color: C.texto, fontSize: 16, fontWeight: '700' }}>{e.nombreCompleto}</Text>
                <Ilustracion ejercicio={e} ancho={width - 56} />
                <Text style={{ color: C.texto }}>
                  {x.series} series{x.repsMin != null ? ` × ${x.repsMin}–${x.repsMax} reps` : ''} · descanso {descanso(x.descansoS)}
                </Text>
              </Pressable>
              {opciones > 1 && (
                <Pressable onPress={() => cambiar(k)} accessibilityRole="button" accessibilityLabel={`Cambiar ${e.nombreCompleto} por otro ejercicio`} style={{ minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' }}>
                  <Text style={{ color: C.acento, fontWeight: '600' }}>Cambiar ejercicio ({((indices[k] ?? 0) % opciones) + 1}/{opciones})</Text>
                </Pressable>
              )}
            </View>
          );
        })}
        <Text style={{ color: C.tenue, fontSize: 13, lineHeight: 19 }}>
          Elige un peso con el que acabes cada serie dejando 1–3 repeticiones en reserva. Cuando llegues al máximo de repeticiones en todas las series, sube el peso.
        </Text>
      </Seccion>

      {elegidos.length > 0 && (
        <View style={{ gap: 10 }}>
          <TextInput
            value={nombre ?? sug.nombre}
            onChangeText={setNombre}
            accessibilityLabel="Nombre de la rutina"
            placeholderTextColor={C.tenue}
            style={{ minHeight: 44, backgroundColor: C.tarjeta, color: C.texto, borderRadius: 10, paddingHorizontal: 12, fontSize: 16 }}
          />
          <Boton texto="Guardar como rutina" activo onPress={guardar} />
        </View>
      )}
    </ScrollView>
  );
}
