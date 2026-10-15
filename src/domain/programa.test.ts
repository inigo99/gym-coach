import { EJERCICIOS } from '@/catalogo';
import { pautaNutricion } from './nutricion';
import { DIAS_PROGRAMA, generarPrograma, lunesDe, OBJETIVOS_PROGRAMA, pautaSemana, semanaActual, sesionesPrevistas, type ConfigPrograma } from './programa';

const base: ConfigPrograma = { objetivo: 'musculo', dias: 3, semanas: 8, nivel: 'intermedio', material: 'gimnasio', minutos: 60 };

test('cada combinación de objetivo y días da un día por sesión, sin ejercicios repetidos en el día', () => {
  for (const { id: objetivo } of OBJETIVOS_PROGRAMA)
    for (const dias of DIAS_PROGRAMA)
      for (const material of ['gimnasio', 'mancuernas', 'casa'] as const) {
        const p = generarPrograma({ ...base, objetivo, dias, material }, EJERCICIOS);
        expect(p).toHaveLength(dias);
        expect(new Set(p.map((d) => d.dia)).size).toBe(dias);
        for (const d of p) {
          expect(d.ejercicios.length).toBeGreaterThanOrEqual(2);
          expect(new Set(d.ejercicios.map((e) => e.ejercicio.id)).size).toBe(d.ejercicios.length);
        }
      }
});

test('días repetidos (A/B) varían los ejercicios; cardio solo si el objetivo lo pide', () => {
  const p = generarPrograma({ ...base, dias: 4 }, EJERCICIOS);
  expect(p.map((d) => d.nombre)).toEqual(['Torso A', 'Pierna A', 'Torso B', 'Pierna B']);
  expect(p[0].ejercicios[0].ejercicio.id).not.toBe(p[2].ejercicios[0].ejercicio.id);
  const cardio = (o: ConfigPrograma['objetivo']) => generarPrograma({ ...base, objetivo: o }, EJERCICIOS)[0].ejercicios.some((e) => e.ejercicio.registro === 'cardio');
  expect(cardio('musculo')).toBe(false);
  expect(cardio('perder_peso')).toBe(true);
});

test('fechas: lunes, semana en curso y sesiones previstas', () => {
  expect(lunesDe(new Date(2026, 9, 15))).toBe('2026-10-12'); // jueves → lunes
  expect(lunesDe(new Date(2026, 9, 12))).toBe('2026-10-12');
  expect(semanaActual('2026-10-12', 4, new Date(2026, 9, 18))).toBe(1);
  expect(semanaActual('2026-10-12', 4, new Date(2026, 9, 19))).toBe(2);
  expect(semanaActual('2026-10-12', 4, new Date(2026, 10, 9))).toBeNull();
  // Lunes, miércoles y viernes; hoy es el miércoles de la 2.ª semana: 3 + 2.
  expect(sesionesPrevistas('2026-10-12', 4, [1, 3, 5], new Date(2026, 9, 21))).toBe(5);
});

test('pauta: bloques de 4 con descarga, y última semana', () => {
  expect([1, 2, 3, 4, 5].map((s) => pautaSemana(s, 8).descarga)).toEqual([false, false, false, true, false]);
  expect(pautaSemana(8, 8).titulo).toBe('Última semana');
});

test('nutrición: déficit para perder peso, superávit para músculo, nunca por debajo del reposo', () => {
  const d = { sexo: 'h' as const, edad: 30, alturaCm: 178, pesoKg: 80, dias: 4 };
  const perder = pautaNutricion({ ...d, objetivo: 'perder_peso' });
  const ganar = pautaNutricion({ ...d, objetivo: 'musculo' });
  expect(perder.kcal).toBeLessThan(perder.mantenimiento);
  expect(ganar.kcal).toBeGreaterThan(ganar.mantenimiento);
  expect(perder.reposo).toBe(1750); // 800 + 1112,5 − 150 + 5 = 1767,5, redondeado a 50
  const bajita = pautaNutricion({ sexo: 'm', edad: 60, alturaCm: 150, pesoKg: 45, dias: 2, objetivo: 'perder_peso' });
  expect(bajita.kcal).toBeGreaterThanOrEqual(1200);
  expect(ganar.proteina).toEqual([128, 176]);
});
