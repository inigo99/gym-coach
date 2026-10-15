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
