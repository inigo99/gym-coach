import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import musculos from '@/assets/data/musculos.json';
import { colorEscala, Cuerpo, ESCALA, SIN_COLOR } from '@/components/cuerpo';
import { Chips, Seccion } from '@/components/ui';
import { C } from '@/constants/theme';
import { db } from '@/db';
import { ejercicio } from '@/db/schema';
import { nivel, nivelPorGrupo, NIVELES, seriesPorSemana } from '@/domain/nivel';
import { useNiveles } from '@/hooks/use-niveles';

const VISTAS = [
  { id: 'nivel', nombre: 'Fuerza' },
  { id: 'volumen', nombre: 'Volumen' },
] as const;
const SEMANAS_VOLUMEN = 4;
const VOLUMEN_ALTO = 20; // series/semana que se pintan con el tono más intenso (rango orientativo 10–20)

export default function CuerpoTab() {
  const [vista, setVista] = useState<(typeof VISTAS)[number]['id']>('nivel');
  const [desde] = useState(() => Date.now() - SEMANAS_VOLUMEN * 7 * 86_400_000);
  const { data: ejercicios } = useLiveQuery(db.select().from(ejercicio));
  const { puntos, series, falta } = useNiveles();
  const musc = new Map(ejercicios.map((e) => [e.id, { principales: e.musculosPrincipales, secundarios: e.musculosSecundarios }]));

  const porNivel = nivelPorGrupo([...puntos].filter(([id]) => musc.has(id)).map(([id, p]) => ({ ...musc.get(id)!, puntuacion: p.puntuacion })));
  const porVolumen = seriesPorSemana(
    series.filter((s) => !s.calentamiento && Date.parse(s.inicio) >= desde && musc.has(s.ejercicioId)).map((s) => musc.get(s.ejercicioId)!),
    SEMANAS_VOLUMEN,
  );

  const datos = vista === 'nivel' ? porNivel : porVolumen;
  const colores = Object.fromEntries([...datos].map(([m, v]) => [m, vista === 'nivel' ? colorEscala((v - 1) / 4) : colorEscala(Math.min(1, v / VOLUMEN_ALTO))]));
  const lista = musculos.filter((m) => m.id !== 'cuello').sort((a, b) => (datos.get(b.id) ?? -1) - (datos.get(a.id) ?? -1));
  const conDatos = lista.filter((m) => datos.has(m.id));

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 24, paddingBottom: 40 }}>
      <Chips opciones={VISTAS} valor={vista} onChange={setVista} />

      {vista === 'nivel' && falta ? (
        <Pressable onPress={() => router.push('/perfil')} accessibilityRole="link">
          <Text style={{ color: C.texto }}>
            Para calcular tu nivel necesito {falta === 'sexo' ? 'tu sexo' : 'tu peso'}. <Text style={{ color: C.acento, fontWeight: '600' }}>Ir a Perfil</Text>
          </Text>
        </Pressable>
      ) : (
        <>
          <Cuerpo
            colores={colores}
            alto={260}
            descripcion={conDatos.length ? `Más ${vista === 'nivel' ? 'fuerte' : 'entrenado'}: ${conDatos[0].nombre}` : 'Sin datos todavía'}
          />
          <Leyenda vista={vista} />
        </>
      )}

      <Seccion titulo={vista === 'nivel' ? 'Nivel por grupo · últimas 8 semanas' : `Series por semana · últimas ${SEMANAS_VOLUMEN} semanas`}>
        {lista.map((m) => {
          const v = datos.get(m.id);
          return (
            <View key={m.id} style={{ flexDirection: 'row', alignItems: 'center', minHeight: 40, gap: 10, borderBottomWidth: 1, borderColor: C.borde }}>
              <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: v != null ? colores[m.id] : SIN_COLOR }} />
              <Text style={{ flex: 1, color: v != null ? C.texto : C.tenue }}>{m.nombre}</Text>
              <Text style={{ color: v != null ? C.texto : C.tenue, fontWeight: v != null ? '600' : '400' }}>
                {v == null ? 'Sin datos' : vista === 'nivel' ? `${nivel(v).nombre}${nivel(v).haciaSiguiente != null ? ` · ${Math.round(nivel(v).haciaSiguiente! * 100)} %` : ''}` : v.toLocaleString('es-ES', { maximumFractionDigits: 1 })}
              </Text>
            </View>
          );
        })}
      </Seccion>

      <Text style={{ color: C.tenue, fontSize: 12, lineHeight: 18 }}>
        {vista === 'nivel'
          ? 'Nivel según tu mejor 1RM estimado (o repeticiones) frente a los estándares de Strength Level, por ejercicio y sexo; cada grupo pondera sus ejercicios (principal ×1, secundario ×0,5). Solo grupos con al menos un ejercicio principal registrado. La edad no ajusta el nivel.'
          : 'Series de trabajo: 1 por músculo principal y 0,5 por secundario. Como referencia orientativa, muchas pautas proponen 10–20 series semanales por grupo.'}
      </Text>
    </ScrollView>
  );
}

function Leyenda({ vista }: { vista: 'nivel' | 'volumen' }) {
  const textos = vista === 'nivel' ? NIVELES.map((n) => n) : ['0', '5', '10', '15', '20+'];
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {ESCALA.map((c, i) => (
        <View key={c} style={{ flex: 1, gap: 4 }}>
          <View style={{ height: 8, borderRadius: 4, backgroundColor: c }} />
          <Text style={{ color: C.tenue, fontSize: 10, textAlign: 'center' }}>{textos[i]}</Text>
        </View>
      ))}
    </View>
  );
}
