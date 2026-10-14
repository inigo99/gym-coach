import { asc, eq, sql } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Boton, Seccion } from '@/components/ui';
import { C } from '@/constants/theme';
import { db } from '@/db';
import { crearRutina, guardarHorario, quitarHorario } from '@/db/rutina';
import { horario, rutina, rutinaEjercicio, type Horario, type Rutina } from '@/db/schema';
import { DIAS, leerHora, textoHora } from '@/domain/horario';

export default function Rutinas() {
  const { data: rutinas } = useLiveQuery(
    db
      .select({ id: rutina.id, nombre: rutina.nombre, n: sql<number>`count(${rutinaEjercicio.ejercicioId})` })
      .from(rutina)
      .leftJoin(rutinaEjercicio, eq(rutinaEjercicio.rutinaId, rutina.id))
      .groupBy(rutina.id)
      .orderBy(asc(rutina.nombre)),
  );
  const { data: dias } = useLiveQuery(db.select().from(horario));
  const [nueva, setNueva] = useState('');
  const [editando, setEditando] = useState<number | null>(null);

  const crear = () => {
    const id = crearRutina(nueva.trim());
    setNueva('');
    router.push(`/rutina/${id}`);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 24 }} keyboardShouldPersistTaps="handled">
      <Seccion titulo="Rutinas">
        {rutinas.map((r) => (
          <Pressable key={r.id} onPress={() => router.push(`/rutina/${r.id}`)} accessibilityRole="button" style={{ backgroundColor: C.tarjeta, borderRadius: 10, padding: 14, gap: 4 }}>
            <Text style={{ color: C.texto, fontSize: 16, fontWeight: '600' }}>{r.nombre}</Text>
            <Text style={{ color: C.tenue, fontSize: 13 }}>{r.n === 1 ? '1 ejercicio' : `${r.n} ejercicios`}</Text>
          </Pressable>
        ))}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            value={nueva}
            onChangeText={setNueva}
            onSubmitEditing={() => nueva.trim() && crear()}
            placeholder="Nueva rutina (p. ej. Pierna)"
            placeholderTextColor={C.tenue}
            accessibilityLabel="Nombre de la nueva rutina"
            style={{ flex: 1, minHeight: 44, backgroundColor: C.tarjeta, color: C.texto, borderRadius: 10, paddingHorizontal: 12, fontSize: 16 }}
          />
          <View style={{ flexGrow: 0 }}>
            <Boton texto="Crear" activo deshabilitado={!nueva.trim()} onPress={crear} />
          </View>
        </View>
      </Seccion>

      <Seccion titulo="Horario semanal">
        {!rutinas.length && <Text style={{ color: C.tenue }}>Crea una rutina para asignarla a un día.</Text>}
        {rutinas.length > 0 &&
          DIAS.map((nombre, i) => {
            const dia = i + 1;
            const fila = dias.find((d) => d.dia === dia);
            return editando === dia ? (
              <EditarDia key={dia} dia={dia} fila={fila} rutinas={rutinas} onCerrar={() => setEditando(null)} />
            ) : (
              <Pressable key={dia} onPress={() => setEditando(dia)} accessibilityRole="button" accessibilityHint="Cambiar la rutina de este día" style={{ flexDirection: 'row', minHeight: 44, alignItems: 'center', borderBottomWidth: 1, borderColor: C.borde }}>
                <Text style={{ width: 100, color: C.texto, fontWeight: '600' }}>{nombre}</Text>
                <Text style={{ flex: 1, color: fila ? C.texto : C.tenue }}>
                  {fila ? `${rutinas.find((r) => r.id === fila.rutinaId)?.nombre} · ${textoHora(fila.hora, fila.minuto)}` : 'Descanso'}
                </Text>
              </Pressable>
            );
          })}
      </Seccion>
    </ScrollView>
  );
}

function EditarDia({ dia, fila, rutinas, onCerrar }: { dia: number; fila?: Horario; rutinas: Pick<Rutina, 'id' | 'nombre'>[]; onCerrar: () => void }) {
  const [rutinaId, setRutinaId] = useState(fila?.rutinaId ?? rutinas[0].id);
  const [hora, setHora] = useState(fila ? textoHora(fila.hora, fila.minuto) : '18:00');
  const h = leerHora(hora);

  return (
    <View style={{ backgroundColor: C.tarjeta, borderRadius: 10, padding: 14, gap: 12 }}>
      <Text style={{ color: C.texto, fontWeight: '700' }}>{DIAS[dia - 1]}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {rutinas.map((r) => (
          <Pressable
            key={r.id}
            onPress={() => setRutinaId(r.id)}
            accessibilityRole="radio"
            accessibilityState={{ checked: rutinaId === r.id }}
            style={{ minHeight: 44, paddingHorizontal: 14, justifyContent: 'center', borderRadius: 22, backgroundColor: rutinaId === r.id ? C.acento : C.fondo }}>
            <Text style={{ color: rutinaId === r.id ? C.fondo : C.texto, fontWeight: '600' }}>{r.nombre}</Text>
          </Pressable>
        ))}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={{ color: h ? C.tenue : C.acento }}>Hora del aviso</Text>
        <TextInput
          value={hora}
          onChangeText={setHora}
          keyboardType="numbers-and-punctuation"
          accessibilityLabel="Hora del aviso, formato 18:30"
          style={{ width: 90, minHeight: 44, backgroundColor: C.fondo, color: C.texto, borderRadius: 10, paddingHorizontal: 12, fontSize: 16, borderWidth: 1, borderColor: h ? C.borde : C.acento }}
        />
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Boton
          texto="Guardar"
          activo
          deshabilitado={!h}
          onPress={() => {
            guardarHorario({ dia, rutinaId, ...h! });
            onCerrar();
          }}
        />
        {fila && (
          <Boton
            texto="Día de descanso"
            onPress={() => {
              quitarHorario(dia);
              onCerrar();
            }}
          />
        )}
        <Boton texto="Cancelar" onPress={onCerrar} />
      </View>
    </View>
  );
}
