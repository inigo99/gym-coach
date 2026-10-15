import { and, asc, desc, eq, gte, inArray, isNotNull, isNull } from 'drizzle-orm';
import { router } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { Grafica } from '@/components/grafica';
import { Boton, Seccion } from '@/components/ui';
import { C } from '@/constants/theme';
import { db } from '@/db';
import { terminarPrograma } from '@/db/programa';
import { medicion, perfil, programa, programaRutina, rutina, sesion } from '@/db/schema';
import { useLiveQuery } from '@/db/use-live-query';
import { edad } from '@/domain/calculos';
import { DIAS } from '@/domain/horario';
import { pautaNutricion } from '@/domain/nutricion';
import { finPrevisto, OBJETIVOS_PROGRAMA, pautaSemana, semanaActual, sesionesPrevistas, textoCardio } from '@/domain/programa';

const kg = (v: number) => `${v.toFixed(1).replace('.', ',')} kg`;
const fechaCorta = (s: string) => new Date(`${s}T12:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

export default function ProgramaActivo() {
  const { data: activos } = useLiveQuery(db.select().from(programa).where(isNull(programa.fin)).orderBy(desc(programa.id)).limit(1));
  const p = activos[0];
  const { data: dias } = useLiveQuery(
    db.select({ dia: programaRutina.dia, rutinaId: rutina.id, nombre: rutina.nombre }).from(programaRutina).innerJoin(rutina, eq(rutina.id, programaRutina.rutinaId)).where(eq(programaRutina.programaId, p?.id ?? -1)).orderBy(asc(programaRutina.dia)),
    [p?.id],
  );
  const ids = dias.map((d) => d.rutinaId);
  const { data: hechas } = useLiveQuery(
    db.select({ id: sesion.id }).from(sesion).where(and(inArray(sesion.rutinaId, ids), isNotNull(sesion.fin), gte(sesion.inicio, p?.inicio ?? '9999'))),
    [ids.join(), p?.inicio],
  );
  const { data: mediciones } = useLiveQuery(db.select({ fecha: medicion.fecha, pesoKg: medicion.pesoKg }).from(medicion).orderBy(asc(medicion.fecha), asc(medicion.id)));
  const { data: perfiles } = useLiveQuery(db.select().from(perfil));

  if (!p) {
    return (
      <View style={{ padding: 16, gap: 16 }}>
        <Stack.Screen options={{ title: 'Programa' }} />
        <Text style={{ color: C.tenue }}>No tienes ningún programa en marcha.</Text>
        <Boton texto="Empezar un programa" activo onPress={() => router.replace('/programa/nuevo')} />
      </View>
    );
  }

  const hoy = new Date();
  const semana = semanaActual(p.inicio, p.semanas, hoy);
  const objetivo = OBJETIVOS_PROGRAMA.find((o) => o.id === p.objetivo)!;
  const previstas = sesionesPrevistas(p.inicio, p.semanas, dias.map((d) => d.dia), hoy);
  const pauta = semana ? pautaSemana(semana, p.semanas) : null;

  // Peso: el último antes del inicio (o el primero después) frente al último registrado.
  const antes = mediciones.filter((m) => m.fecha <= p.inicio).at(-1) ?? mediciones.find((m) => m.fecha > p.inicio);
  const ahora = mediciones.at(-1);
  const desde = mediciones.filter((m) => m.fecha >= (antes?.fecha ?? p.inicio)).map((m) => ({ fecha: m.fecha, valor: m.pesoKg }));

  const yo = perfiles[0];
  const nutricion =
    yo?.sexo && yo.nacimiento && yo.alturaCm && ahora
      ? pautaNutricion({ sexo: yo.sexo, edad: edad(yo.nacimiento), alturaCm: yo.alturaCm, pesoKg: ahora.pesoKg, dias: p.dias, objetivo: p.objetivo })
      : null;

  const terminar = () =>
    Alert.alert('¿Terminar el programa?', 'Las rutinas y el horario se quedan como están; puedes cambiarlos cuando quieras.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Terminar', style: 'destructive', onPress: () => terminarPrograma(p.id, hoy.toISOString().slice(0, 10)) },
    ]);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 26, paddingBottom: 48 }}>
      <Stack.Screen options={{ title: objetivo.nombre }} />

      <View style={{ gap: 8 }}>
        <Text style={{ color: C.texto, fontSize: 22, fontWeight: '700' }}>{semana ? `Semana ${semana} de ${p.semanas}` : 'Programa completado'}</Text>
        <Text style={{ color: C.tenue }}>
          Del {fechaCorta(p.inicio)} al {fechaCorta(finPrevisto(p.inicio, p.semanas))} · {p.dias} días por semana
        </Text>
        <View style={{ height: 8, borderRadius: 4, backgroundColor: C.tarjeta, overflow: 'hidden' }} accessibilityLabel={`Semana ${semana ?? p.semanas} de ${p.semanas}`}>
          <View style={{ width: `${((semana ?? p.semanas) / p.semanas) * 100}%`, height: '100%', backgroundColor: C.acento }} />
        </View>
      </View>

      {pauta && (
        <View style={{ backgroundColor: C.tarjeta, borderRadius: 12, padding: 14, gap: 6, borderLeftWidth: 4, borderLeftColor: pauta.descarga ? C.tenue : C.acento }}>
          <Text style={{ color: C.texto, fontWeight: '700', fontSize: 16 }}>Esta semana: {pauta.titulo}</Text>
          <Text style={{ color: C.texto, lineHeight: 21 }}>{pauta.texto}</Text>
        </View>
      )}

      <Seccion titulo="Tu semana">
        {dias.map((d) => (
          <Pressable
            key={d.rutinaId}
            onPress={() => router.push(`/rutina/${d.rutinaId}`)}
            accessibilityRole="button"
            style={{ flexDirection: 'row', minHeight: 44, alignItems: 'center', borderBottomWidth: 1, borderColor: C.borde }}>
            <Text style={{ width: 100, color: C.texto, fontWeight: '600' }}>{DIAS[d.dia - 1]}</Text>
            <Text style={{ flex: 1, color: C.texto }}>{d.nombre}</Text>
          </Pressable>
        ))}
        <Text style={{ color: C.tenue, lineHeight: 20 }}>{textoCardio(p)}</Text>
      </Seccion>

      <Seccion titulo="Seguimiento">
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Dato valor={`${hechas.length} / ${previstas}`} etiqueta="sesiones hechas" />
          <Dato valor={antes && ahora ? `${ahora.pesoKg - antes.pesoKg > 0 ? '+' : ''}${kg(ahora.pesoKg - antes.pesoKg)}` : '—'} etiqueta={antes && ahora ? `peso: ${kg(ahora.pesoKg)}` : 'registra tu peso en Perfil'} />
        </View>
        {desde.length > 1 && <Grafica puntos={desde} formato={kg} />}
      </Seccion>

      <Seccion titulo="Alimentación orientativa">
        {nutricion ? (
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Dato valor={`${nutricion.kcal} kcal`} etiqueta={`al día (mantener: ${nutricion.mantenimiento})`} />
              <Dato valor={`${nutricion.proteina[0]}–${nutricion.proteina[1]} g`} etiqueta="de proteína al día" />
            </View>
            <Text style={{ color: C.texto, lineHeight: 21 }}>{nutricion.ritmo}</Text>
            <Text style={{ color: C.tenue, fontSize: 12, lineHeight: 18 }}>
              Estimación con la fórmula de Mifflin-St Jeor y tus datos del perfil. Es orientativa: ajústala según cómo cambie tu peso en 2–3 semanas y consulta a un dietista-nutricionista si tienes alguna condición de salud.
            </Text>
          </View>
        ) : (
          <Pressable onPress={() => router.push('/perfil')} accessibilityRole="link">
            <Text style={{ color: C.tenue, lineHeight: 21 }}>
              Completa sexo, fecha de nacimiento, altura y peso en <Text style={{ color: C.acento }}>Perfil</Text> para ver calorías y proteína orientativas.
            </Text>
          </Pressable>
        )}
      </Seccion>

      {semana ? <Boton texto="Terminar programa" onPress={terminar} /> : <Boton texto="Empezar otro programa" activo onPress={() => router.push('/programa/nuevo')} />}
    </ScrollView>
  );
}

function Dato({ valor, etiqueta }: { valor: string; etiqueta: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: C.tarjeta, borderRadius: 12, padding: 12, gap: 2 }}>
      <Text style={{ color: C.texto, fontSize: 20, fontWeight: '700' }}>{valor}</Text>
      <Text style={{ color: C.tenue, fontSize: 13 }}>{etiqueta}</Text>
    </View>
  );
}
