import { desc } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { CopiaSeguridad } from '@/components/copia-seguridad';
import { Boton, BotonIcono, Campo, num, Seccion } from '@/components/ui';

import { C } from '@/constants/theme';
import { borrarMedicion, db, guardarPerfil } from '@/db';
import { medicion, perfil, type Medicion as MedicionT, type Perfil as PerfilT } from '@/db/schema';
import { edad, imc } from '@/domain/calculos';

const fechaValida = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s));
const hoy = () => new Date().toISOString().slice(0, 10);

export default function Perfil() {
  const { data: perfiles } = useLiveQuery(db.select().from(perfil));
  const { data: mediciones } = useLiveQuery(db.select().from(medicion).orderBy(desc(medicion.fecha), desc(medicion.id)));
  const p = perfiles[0];

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 24 }} keyboardShouldPersistTaps="handled">
      {/* key: el formulario se monta de nuevo cuando llega el perfil guardado */}
      <Datos key={p ? 'guardado' : 'nuevo'} p={p} pesoActual={mediciones[0]?.pesoKg} />
      <Mediciones mediciones={mediciones} />
      <CopiaSeguridad />
    </ScrollView>
  );
}

function Datos({ p, pesoActual }: { p?: PerfilT; pesoActual?: number }) {
  const [nombre, setNombre] = useState(p?.nombre ?? '');
  const [nacimiento, setNacimiento] = useState(p?.nacimiento ?? '');
  const [sexo, setSexo] = useState(p?.sexo ?? null);
  const [altura, setAltura] = useState(p?.alturaCm?.toString() ?? '');
  const alturaN = num(altura);
  const nacOk = nacimiento === '' || fechaValida(nacimiento);

  return (
    <Seccion titulo="Datos">
      <Campo etiqueta="Nombre" valor={nombre} onChange={setNombre} />
      <Campo etiqueta="Fecha de nacimiento (AAAA-MM-DD)" valor={nacimiento} onChange={setNacimiento} error={!nacOk} />
      <Campo etiqueta="Altura (cm)" valor={altura} onChange={setAltura} numerico />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {(['h', 'm'] as const).map((s) => (
          <Boton key={s} texto={s === 'h' ? 'Hombre' : 'Mujer'} activo={sexo === s} onPress={() => setSexo(s)} />
        ))}
      </View>
      <Boton
        texto="Guardar"
        activo
        deshabilitado={!nacOk}
        onPress={() => guardarPerfil({ nombre: nombre || null, nacimiento: nacimiento || null, sexo, alturaCm: alturaN })}
      />
      {(p?.nacimiento || (pesoActual && p?.alturaCm)) && (
        <Text style={{ color: C.tenue }}>
          {[p?.nacimiento && `${edad(p.nacimiento)} años`, pesoActual && p?.alturaCm && `IMC ${imc(pesoActual, p.alturaCm).toFixed(1)}`]
            .filter(Boolean)
            .join(' · ')}
        </Text>
      )}
    </Seccion>
  );
}

function Mediciones({ mediciones }: { mediciones: MedicionT[] }) {
  const [peso, setPeso] = useState('');
  const [grasa, setGrasa] = useState('');
  const pesoN = num(peso);

  return (
    <Seccion titulo="Mediciones">
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={{ flex: 1 }}><Campo etiqueta="Peso (kg)" valor={peso} onChange={setPeso} numerico /></View>
        <View style={{ flex: 1 }}><Campo etiqueta="Grasa (%)" valor={grasa} onChange={setGrasa} numerico /></View>
      </View>
      <Boton
        texto="Añadir medición de hoy"
        activo
        deshabilitado={!(pesoN && pesoN > 0)}
        onPress={() => {
          db.insert(medicion).values({ fecha: hoy(), pesoKg: pesoN!, grasaPct: num(grasa) }).run();
          setPeso('');
          setGrasa('');
        }}
      />
      {mediciones.map((m) => (
        <View key={m.id} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.tarjeta, borderRadius: 10, paddingLeft: 14 }}>
          <Text style={{ color: C.texto, flex: 1 }}>
            {m.fecha} · {m.pesoKg} kg{m.grasaPct != null ? ` · ${m.grasaPct} %` : ''}
          </Text>
          <BotonIcono texto="×" etiqueta={`Borrar medición del ${m.fecha}`} onPress={() => borrarMedicion(m.id)} />
        </View>
      ))}
    </Seccion>
  );
}
