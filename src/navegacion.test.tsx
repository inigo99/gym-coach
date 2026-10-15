/* eslint-disable @typescript-eslint/no-require-imports -- jest.mock necesita require */
import { renderRouter, screen, testRouter } from 'expo-router/testing-library';
import { View } from 'react-native';

// Estructura real de rutas con pantallas vacías: comprueba que la ficha de ejercicio se abre
// dentro de la pestaña en la que estás (con la barra inferior) y que "atrás" vuelve a ella.
jest.mock('@expo/vector-icons/Ionicons', () => () => null);

const P = () => <View />;
const ficha = { default: P };
const pila = require('@/components/pila');

test('la ficha de ejercicio se abre dentro de cada pestaña y con su barra', () => {
  const r = renderRouter(
    {
      '(tabs)/_layout': require('@/app/(tabs)/_layout'),
      '(tabs)/(entrenar)/_layout': { default: () => <pila.Pila raiz="index" titulo="Entrenar" /> },
      '(tabs)/(entrenar)/index': P,
      '(tabs)/(rutinas)/_layout': { default: () => <pila.Pila raiz="rutinas" titulo="Rutinas" /> },
      '(tabs)/(rutinas)/rutinas': P,
      '(tabs)/(rutinas)/ejercicio/[id]': ficha,
      '(tabs)/(ejercicios)/_layout': { default: () => <pila.Pila raiz="ejercicios" titulo="Ejercicios" /> },
      '(tabs)/(ejercicios)/ejercicios': P,
      '(tabs)/(ejercicios)/ejercicio/[id]': ficha,
      '(tabs)/(progreso)/_layout': { default: () => <pila.Pila raiz="progreso" titulo="Progreso" /> },
      '(tabs)/(progreso)/progreso': P,
      '(tabs)/(progreso)/ejercicio/[id]': ficha,
      '(tabs)/(perfil)/_layout': { default: () => <pila.Pila raiz="perfil" titulo="Perfil" /> },
      '(tabs)/(perfil)/perfil': P,
    },
    { initialUrl: '/' },
  );
  expect(r.getSegments()).toEqual(['(tabs)', '(entrenar)']);

  testRouter.navigate('/ejercicios');
  testRouter.push('/ejercicio/cat:barbell_curl');
  expect(r.getSegments()).toEqual(['(tabs)', '(ejercicios)', 'ejercicio', '[id]']);
  expect(screen.getByText('Progreso')).toBeVisible(); // barra inferior
  testRouter.back('/ejercicios');

  testRouter.navigate('/progreso');
  testRouter.push('/ejercicio/cat:barbell_squat');
  expect(r.getSegments()).toEqual(['(tabs)', '(progreso)', 'ejercicio', '[id]']);
});
