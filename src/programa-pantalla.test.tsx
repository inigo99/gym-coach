/* eslint-disable @typescript-eslint/no-require-imports -- jest.mock necesita require */
import { Text } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import { EJERCICIOS } from '@/catalogo';
import { empezarPrograma } from '@/db/programa';
import { sembrarCatalogo } from '@/db/semilla';
import { generarPrograma, lunesDe, type ConfigPrograma } from '@/domain/programa';

// Pantalla del programa con la BD real en memoria (sin avisos de cambios).
jest.mock('@/db/index', () => require('@/db/bd-prueba'));
jest.mock('expo-sqlite', () => ({ addDatabaseChangeListener: () => ({ remove: () => {} }) }));
jest.mock('expo-router', () => ({ router: { push: jest.fn(), replace: jest.fn() } }));
jest.mock('expo-router/stack', () => ({ Stack: { Screen: () => null } }));
jest.mock('react-native-svg', () => {
  const R = require('react');
  const C = (p: object) => R.createElement('svg', p);
  return { __esModule: true, default: C, Line: C, Path: C, Circle: C, Rect: C, Polyline: C, G: C, Text: C };
});

test('programa activo: semana, pauta, seguimiento y alimentación', async () => {
  const { db } = require('@/db/bd-prueba');
  const { medicion, perfil } = require('@/db/schema');
  sembrarCatalogo();
  db.insert(perfil).values({ id: 1, sexo: 'h', nacimiento: '1995-05-01', alturaCm: 178 }).run();
  db.insert(medicion).values({ fecha: '2026-01-01', pesoKg: 82 }).run();
  const c: ConfigPrograma = { objetivo: 'perder_peso', dias: 3, semanas: 8, nivel: 'intermedio', material: 'gimnasio', minutos: 60 };
  const hoy = new Date();
  empezarPrograma(c, generarPrograma(c, EJERCICIOS), lunesDe(hoy), hoy.toISOString().slice(0, 10));

  const Pantalla = require('./app/(tabs)/(rutinas)/programa/index').default;
  let r: ReactTestRenderer;
  await act(async () => {
    r = create(<Pantalla />);
  });
  await act(async () => {}); // segunda vuelta: consultas que dependen de la primera
  const t = r!.root.findAllByType(Text).map((n) => [n.props.children].flat(9).join('')).join(' | ');
  expect(t).toContain('Semana 1 de 8');
  expect(t).toContain('Esta semana: Semana de adaptación');
  expect(t).toContain('sesiones hechas');
  expect(t).toMatch(/\d+ kcal/);
  expect(t).toContain('Perder peso · Cuerpo completo A');
});
