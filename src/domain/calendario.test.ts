import { claveDia, semanasDelMes } from './calendario';

test('semanas del mes: de lunes a domingo y completas', () => {
  const oct = semanasDelMes(2026, 9); // octubre 2026 empieza en jueves
  expect(oct[0].map((d) => d.dia)).toEqual([28, 29, 30, 1, 2, 3, 4]);
  expect(oct[0][3]).toEqual({ clave: '2026-10-01', dia: 1, delMes: true });
  expect(oct.at(-1)!.map((d) => d.clave)).toEqual(['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01']);
  expect(oct.flat().filter((d) => d.delMes)).toHaveLength(31);
  expect(semanasDelMes(2027, 1)).toHaveLength(4); // febrero 2027: empieza en lunes y tiene 28 días
  expect(claveDia(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05');
});
