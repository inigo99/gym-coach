import { act, create } from 'react-test-renderer';

import { useLiveQuery } from './use-live-query';

let avisar: () => void = () => {};
jest.mock('expo-sqlite', () => ({
  addDatabaseChangeListener: (f: () => void) => ((avisar = f), { remove: () => {} }),
}));

test('recarga aunque cambie otra tabla (cerrar la sesión no toca la tabla de series)', async () => {
  let n = 0;
  // Como una consulta de drizzle: cada `then` la vuelve a ejecutar.
  const consulta: PromiseLike<number[]> = { then: (...a) => Promise.resolve([++n]).then(...a) };
  let visto: number[] = [];
  const Prueba = () => ((visto = useLiveQuery(consulta).data), null);
  await act(async () => void create(<Prueba />));
  expect(visto).toEqual([1]);
  await act(async () => avisar());
  expect(visto).toEqual([2]);
});
