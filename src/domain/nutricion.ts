/**
 * Pautas de alimentación orientativas (no sustituyen a un dietista-nutricionista).
 * Gasto en reposo con Mifflin-St Jeor, factor de actividad según los días de entreno.
 */
export type ObjetivoCuerpo = 'perder_peso' | 'musculo' | 'definir';

export type DatosNutricion = { sexo: 'h' | 'm'; edad: number; alturaCm: number; pesoKg: number; dias: number; objetivo: ObjetivoCuerpo };

export type PautaNutricion = {
  reposo: number; // kcal/día en reposo
  mantenimiento: number; // kcal/día para mantener el peso
  kcal: number; // objetivo
  proteina: [number, number]; // g/día
  ritmo: string;
};

const redondear = (x: number, a = 50) => Math.round(x / a) * a;

export function pautaNutricion(d: DatosNutricion): PautaNutricion {
  const reposo = 10 * d.pesoKg + 6.25 * d.alturaCm - 5 * d.edad + (d.sexo === 'h' ? 5 : -161);
  const factor = d.dias <= 3 ? 1.375 : d.dias <= 5 ? 1.55 : 1.725;
  const mantenimiento = reposo * factor;
  const ajuste = { perder_peso: -0.2, definir: -0.1, musculo: 0.1 }[d.objetivo];
  // En déficit, nunca por debajo del gasto en reposo ni de un mínimo prudente.
  const minimo = Math.max(reposo, d.sexo === 'h' ? 1500 : 1200);
  const kcal = d.objetivo === 'musculo' ? mantenimiento * (1 + ajuste) : Math.max(minimo, mantenimiento * (1 + ajuste));
  const gkg: [number, number] = d.objetivo === 'musculo' ? [1.6, 2.2] : [1.8, 2.2];
  const ritmo = {
    perder_peso: 'Un ritmo sostenible es perder entre el 0,5 % y el 1 % de tu peso por semana.',
    definir: 'Busca bajar despacio, unos 0,25–0,5 % de tu peso por semana, manteniendo las marcas.',
    musculo: 'Busca subir unos 0,25–0,5 % de tu peso al mes; si subes más rápido, quita algo de comida.',
  }[d.objetivo];
  return {
    reposo: redondear(reposo),
    mantenimiento: redondear(mantenimiento),
    kcal: redondear(kcal),
    proteina: [Math.round(gkg[0] * d.pesoKg), Math.round(gkg[1] * d.pesoKg)],
    ritmo,
  };
}
