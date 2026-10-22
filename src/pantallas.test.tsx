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

test('Añadir ejercicio: buscador por nombre con filtros de material', async () => {
  const { TextInput } = require('react-native');
  const { ElegirEjercicio } = require('./components/elegir-ejercicio');
  let r: ReactTestRenderer;
  await act(async () => {
    r = create(<ElegirEjercicio visible yaEnSesion={[]} onElegir={() => {}} onCerrar={() => {}} />);
  });
  const textos = () => r.root.findAllByType(Text).map((n) => [n.props.children].flat(9).join(''));
  expect(textos()).toContain('Filtros');
  // Material: Polea → solo ejercicios con polea
  // El chip "Polea": desde su texto, subir hasta el elemento que se puede pulsar.
  let polea = r!.root.findAllByType(Text).find((t) => t.props.children === 'Polea')!;
  while (!polea.props.onPress) polea = polea.parent!;
  await act(async () => polea.props.onPress());
  expect(textos()).toContain('Remo · En polea, sentado');
  expect(textos()).not.toContain('Press de pecho · Con barra en banco');
  // Y además por nombre
  await act(async () => r.root.findByType(TextInput).props.onChangeText('triceps'));
  expect(textos()).toContain('Extensión de tríceps en polea · Con cuerda');
  expect(textos()).not.toContain('Remo · En polea, sentado');
});
