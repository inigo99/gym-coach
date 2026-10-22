/* eslint-disable @typescript-eslint/no-require-imports -- jest.mock necesita require */
import { Text } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

// Humo: las pantallas de sugerencias y del buscador se pintan sin errores.
jest.mock('@/db/index', () => require('@/db/bd-prueba'));
jest.mock('@/db/use-live-query', () => ({ useLiveQuery: () => ({ data: [] }) }));
jest.mock('expo-router', () => ({ router: { push: jest.fn(), replace: jest.fn() } }));
jest.mock('expo-router/stack', () => ({ Stack: { Screen: () => null } }));
jest.mock('react-native-svg', () => {
  const R = require('react');
  const C = (p: object) => R.createElement('svg', p);
  return { __esModule: true, default: C, Line: C, Path: C, Circle: C, Rect: C };
});
jest.mock('@expo/vector-icons/Ionicons', () => () => null);

const pintar = async (ruta: string): Promise<string> => {
  const Pantalla = require(ruta).default;
  let r: ReactTestRenderer;
  await act(async () => {
    r = create(<Pantalla />);
  });
  // Todos los textos visibles, en orden.
  return r!.root.findAllByType(Text).map((n) => [n.props.children].flat(9).join('')).join(' | ');
};

test('Sugerir rutina propone ejercicios y permite guardarla', async () => {
  const t = await pintar('./app/(tabs)/(rutinas)/rutina/sugerir');
  expect(t).toContain('Guardar como rutina');
  expect(t).toContain('Jalón al pecho');
});

test('Ejercicios: material primero y panel de filtros', async () => {
  const t = await pintar('./app/(tabs)/(ejercicios)/ejercicios');
  expect(t.indexOf('Máquina')).toBeLessThan(t.indexOf('Filtros'));
});

test('Nuevo programa muestra la semana y el botón para empezar', async () => {
  const t = await pintar('./app/(tabs)/(rutinas)/programa/nuevo');
  expect(t).toContain('Empezar programa');
  expect(t).toContain('Cuerpo completo A');
});

test('Programa sin ninguno activo invita a empezar', async () => {
  expect(await pintar('./app/(tabs)/(rutinas)/programa/index')).toContain('Empezar un programa');
});

test('Añadir ejercicio: primero el ejercicio y dentro la variante, con filtros y búsqueda por variante', async () => {
  const { TextInput } = require('react-native');
  const { ElegirEjercicio } = require('./components/elegir-ejercicio');
  const elegido = jest.fn();
  let r: ReactTestRenderer;
  await act(async () => {
    r = create(<ElegirEjercicio visible yaEnSesion={[]} onElegir={elegido} onCerrar={() => {}} />);
  });
  const textos = () => r.root.findAllByType(Text).map((n) => [n.props.children].flat(9).join(''));
  const pulsar = async (texto: string) => {
    let n = r.root.findAllByType(Text).find((t) => [t.props.children].flat(9).join('') === texto)!;
    while (!n.props.onPress) n = n.parent!;
    await act(async () => n.props.onPress());
  };
  expect(textos()).toContain('Filtros');
  // Material: Polea → ejercicios con alguna variante de polea; aún sin abrir, no se ven las variantes
  await pulsar('Polea');
  expect(textos()).toContain('Remo');
  expect(textos()).not.toContain('Peso muerto');
  expect(textos()).not.toContain('En polea, sentado');
  // Al tocar el ejercicio se abren sus variantes (solo las de polea) y se elige una
  await pulsar('Remo');
  expect(textos()).toContain('En polea, sentado');
  expect(textos()).not.toContain('Con barra, inclinado');
  await pulsar('En polea, sentado');
  expect(elegido).toHaveBeenCalledWith('cat:seated_cable_rows');
  // Buscar por variante: "cuerda" abre directamente las variantes que coinciden
  await act(async () => r.root.findByType(TextInput).props.onChangeText('cuerda'));
  expect(textos()).toContain('Con cuerda');
  expect(textos()).not.toContain('Remo');
});

test('Sesión: kg y reps de la última vez ya puestos, sin contar el calentamiento', async () => {
  const { TextInput } = require('react-native');
  const { TarjetaEjercicio } = require('./components/tarjeta-ejercicio');
  const { EJERCICIO } = require('./catalogo');
  const { anadirSerie, empezarSesion, terminarSesion } = require('./db/sesion');
  require('./db/semilla').sembrarCatalogo();
  const ej = EJERCICIO.get('cat:barbell_bench_press_-_medium_grip');
  const antes = empezarSesion();
  anadirSerie({ sesionId: antes, ejercicioId: ej.id, calentamiento: true, pesoKg: 20, reps: 15 });
  anadirSerie({ sesionId: antes, ejercicioId: ej.id, calentamiento: false, pesoKg: 60, reps: 8 });
  terminarSesion(antes);
  const ahora = empezarSesion();
  let r: ReactTestRenderer;
  await act(async () => {
    r = create(<TarjetaEjercicio ejercicio={ej} sesionId={ahora} series={[]} onSerie={() => {}} />);
  });
  expect(r!.root.findAllByType(TextInput).map((n) => n.props.value)).toEqual(['60', '8']);
});
