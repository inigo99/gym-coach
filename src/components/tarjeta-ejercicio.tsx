import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import musculos from '@/assets/data/musculos.json';
import { EJERCICIO } from '@/catalogo';
import { Ilustracion } from '@/components/ilustracion';
import type { Marca, SerieMarca } from '@/domain/marcas';
import { useAnchoContenido } from '@/hooks/use-ancho';

import { Boton, BotonIcono, Campo, num } from '@/components/ui';
import { C } from '@/constants/theme';
import type { Ejercicio, RutinaEjercicio, Serie } from '@/db/schema';
import { anadirSerie, borrarSerie, quitarEjercicio, seriesUltimaVez } from '@/db/sesion';
import { textoObjetivo } from '@/domain/horario';
import { reloj, textoSerie } from '@/domain/sesion';
import { alerta } from '@/alerta';

type Campos = { a: string | null; b: string | null }; // null = usar el valor propuesto

const fmt = (x: number | null | undefined, div = 1) => (x == null ? '' : String(+(x / div).toFixed(2)).replace('.', ','));
const entero = (x: number | null) => (x != null && Number.isInteger(x) && x > 0 ? x : null);

/** Etiquetas y conversión de los dos campos según el tipo de registro. */
const FORMA = {
  carga: {
    a: 'kg', b: 'reps',
    leer: (s: Serie) => [fmt(s.pesoKg), fmt(s.reps)],
    serie: (a: number | null, b: number | null) => (a && a > 0 && entero(b) ? { pesoKg: a, reps: b } : null),
  },
  peso_corporal: {
    a: 'lastre kg', b: 'reps',
    leer: (s: Serie) => [fmt(s.pesoKg), fmt(s.reps)],
    serie: (a: number | null, b: number | null) => ((a ?? 0) >= 0 && entero(b) ? { pesoKg: a || null, reps: b } : null),
  },
  tiempo: {
    a: 'segundos', b: null,
    leer: (s: Serie) => [fmt(s.duracionS), ''],
    serie: (a: number | null) => (entero(a) ? { duracionS: a } : null),
  },
  cardio: {
    a: 'minutos', b: 'km',
    leer: (s: Serie) => [fmt(s.duracionS, 60), fmt(s.distanciaM, 1000)],
    serie: (a: number | null, b: number | null) => (a && a > 0 && (b ?? 0) >= 0 ? { duracionS: Math.round(a * 60), distanciaM: b ? b * 1000 : null } : null),
  },
} as const;

const NOMBRE_MUSCULO = Object.fromEntries(musculos.map((m) => [m.id, m.nombre]));

export function TarjetaEjercicio(props: { ejercicio: Ejercicio; sesionId: number; objetivo?: RutinaEjercicio; series: Serie[]; onSerie: (descansoS: number) => void; marca?: Marca<SerieMarca> }) {
  const { ejercicio: ej, sesionId, series, objetivo } = props;
  const forma = FORMA[ej.registro];
  const ultimaVez = useMemo(() => seriesUltimaVez(ej.id, sesionId), [ej.id, sesionId]);
  const [campos, setCampos] = useState<Campos>({ a: null, b: null });
  const [calentamiento, setCalentamiento] = useState(false);
  const [tecnica, setTecnica] = useState(false);
  const cat = EJERCICIO.get(ej.id);
  const ancho = useAnchoContenido() - 60;

  // Propuesta: la misma serie de la última vez (calentamientos y efectivas por separado) o, si no hay, la última de hoy.
  const delTipo = (xs: Serie[]) => xs.filter((s) => !!s.calentamiento === calentamiento);
  const antes = delTipo(ultimaVez);
  const hoy = delTipo(series);
  const base = antes[hoy.length] ?? hoy.at(-1) ?? antes.at(-1) ?? (calentamiento ? undefined : series.at(-1));
  const [propA, propB] = base ? forma.leer(base) : ['', objetivo?.repsMin ? String(objetivo.repsMin) : '']; // sin historial: reps mínimas del objetivo
  const valA = campos.a ?? propA;
  const valB = campos.b ?? propB;
  const nueva = forma.serie(num(valA), num(valB));

  const anadir = () => {
    if (!nueva) return;
    anadirSerie({ sesionId, ejercicioId: ej.id, calentamiento, ...nueva });
    setCampos({ a: null, b: null });
    setCalentamiento(false);
    if (!calentamiento) props.onSerie(objetivo?.descansoS ?? 90);
  };

  const quitar = () =>
    series.length
      ? alerta(`¿Quitar ${ej.nombre}?`, 'Se borrarán sus series de esta sesión.', [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Quitar', style: 'destructive', onPress: () => quitarEjercicio(sesionId, ej.id) },
        ])
      : quitarEjercicio(sesionId, ej.id);

  const txt = (s: Serie) => textoSerie({ ...s, registro: ej.registro });

  return (
    <View style={{ backgroundColor: C.tarjeta, borderRadius: 12, padding: 14, gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ flex: 1, color: C.texto, fontSize: 17, fontWeight: '700' }}>{ej.nombre}</Text>
        <BotonIcono texto="×" etiqueta={`Quitar ${ej.nombre}`} onPress={quitar} />
      </View>
      {objetivo && (
        <Text style={{ color: C.acento, fontSize: 13, fontWeight: '600' }}>
          Objetivo: {textoObjetivo(objetivo)} · descanso {reloj(objetivo.descansoS)}
        </Text>
      )}
      {ultimaVez.length > 0 && <Text style={{ color: C.tenue, fontSize: 13 }}>Última vez: {ultimaVez.map(txt).join(', ')}</Text>}
      {props.marca && <Text style={{ color: C.tenue, fontSize: 13 }}>Mejor serie: {textoSerie({ ...props.marca.mejor, registro: ej.registro })}</Text>}
      {cat && (
        <Pressable onPress={() => setTecnica((x) => !x)} accessibilityRole="button" accessibilityState={{ expanded: tecnica }} style={{ minHeight: 36, justifyContent: 'center' }}>
          <Text style={{ color: C.acento, fontWeight: '600' }}>{tecnica ? 'Ocultar cómo se hace' : 'Cómo se hace'}</Text>
        </Pressable>
      )}
      {cat && tecnica && (
        <View style={{ gap: 8 }}>
          <View style={{ backgroundColor: C.fondo, borderRadius: 10 }}>
            <Ilustracion ejercicio={cat} ancho={ancho} />
          </View>
          <Text style={{ fontSize: 13 }}>
            <Text style={{ color: C.acento }}>{cat.principales.map((x) => NOMBRE_MUSCULO[x]).join(', ')}</Text>
            {cat.secundarios.length > 0 && <Text style={{ color: C.tenue }}> · {cat.secundarios.map((x) => NOMBRE_MUSCULO[x]).join(', ')}</Text>}
          </Text>
          {cat.tecnica.ejecucion.map((paso, i) => (
            <Text key={i} style={{ color: C.texto, fontSize: 14, lineHeight: 20 }}>
              {i + 1}. {paso}
            </Text>
          ))}
          <Pressable onPress={() => router.push({ pathname: '/ejercicio/[id]', params: { id: ej.id } })} accessibilityRole="link" style={{ minHeight: 36, justifyContent: 'center' }}>
            <Text style={{ color: C.acento, fontWeight: '600' }}>Ficha completa: ajustes, errores y progreso</Text>
          </Pressable>
        </View>
      )}

      {series.map((s, i) => (
        <View key={s.id} style={{ flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderColor: C.borde }}>
          <Text style={{ width: 28, color: s.calentamiento ? C.tenue : C.acento, fontWeight: '700' }}>{s.calentamiento ? 'C' : i + 1 - series.slice(0, i).filter((x) => x.calentamiento).length}</Text>
          <Text style={{ flex: 1, color: s.calentamiento ? C.tenue : C.texto, fontSize: 16, fontVariant: ['tabular-nums'] }}>{txt(s)}</Text>
          <BotonIcono texto="×" etiqueta={`Borrar serie ${txt(s)}`} onPress={() => borrarSerie(s.id)} />
        </View>
      ))}

      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
        <Campo flex etiqueta={ej.equipo === 'mancuerna' && forma.a === 'kg' ? 'kg (cada una)' : forma.a} valor={valA} onChange={(a) => setCampos((c) => ({ ...c, a }))} numerico />
        {forma.b && <Campo flex etiqueta={forma.b} valor={valB} onChange={(b) => setCampos((c) => ({ ...c, b }))} numerico />}
        <Pressable
          onPress={() => setCalentamiento((x) => !x)}
          accessibilityRole="switch"
          accessibilityLabel="Serie de calentamiento"
          accessibilityState={{ checked: calentamiento }}
          style={{ minHeight: 44, minWidth: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: calentamiento ? C.acento : C.borde }}>
          <Text style={{ color: calentamiento ? C.acento : C.tenue, fontWeight: '700' }}>C</Text>
        </Pressable>
      </View>
      <Boton texto={calentamiento ? 'Añadir calentamiento' : 'Añadir serie'} activo deshabilitado={!nueva} onPress={anadir} />
    </View>
  );
}
