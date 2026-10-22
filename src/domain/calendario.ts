/** Utilidades del calendario de entrenamientos (semanas de lunes a domingo, fechas locales). */

export type Dia = { clave: string; dia: number; delMes: boolean };

const dos = (n: number) => String(n).padStart(2, '0');

/** AAAA-MM-DD en hora local (la de la persona, no UTC). */
export const claveDia = (d: Date) => `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;

/** Semanas del mes (`mes` de 0 a 11), de lunes a domingo, con los días de los meses vecinos para completarlas. */
export function semanasDelMes(año: number, mes: number): Dia[][] {
  const primero = new Date(año, mes, 1);
  const desde = new Date(año, mes, 1 - ((primero.getDay() + 6) % 7));
  const semanas: Dia[][] = [];
  for (let d = desde; d.getMonth() === mes || semanas.length === 0 || d < primero; ) {
    const semana: Dia[] = [];
    for (let i = 0; i < 7; i++) {
      semana.push({ clave: claveDia(d), dia: d.getDate(), delMes: d.getMonth() === mes });
      d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    }
    semanas.push(semana);
  }
  return semanas;
}

export const NOMBRE_MES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
export const INICIALES = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export const mayuscula = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export const plural = (n: number, palabra: string) => `${n} ${palabra}${n === 1 ? '' : 's'}`;
