// Genera assets/data/ejercicios.json desde free-exercise-db (uso personal: ver README).
// Uso: npm run catalogo
import { writeFileSync } from 'node:fs';

const FUENTE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';

const MUSCULOS = {
  abdominals: 'abdomen', abductors: 'abductores', adductors: 'aductores', biceps: 'biceps',
  calves: 'gemelos', chest: 'pecho', forearms: 'antebrazos', glutes: 'gluteos',
  hamstrings: 'isquios', lats: 'dorsales', 'lower back': 'lumbar', 'middle back': 'espalda_media',
  neck: 'cuello', quadriceps: 'cuadriceps', shoulders: 'hombros', traps: 'trapecio', triceps: 'triceps',
};
const EQUIPO = {
  barbell: 'barra', dumbbell: 'mancuerna', machine: 'maquina', cable: 'polea',
  'body only': 'peso_corporal', 'e-z curl bar': 'barra_z',
};

// [id en free-exercise-db, nombre, registro]
// registro: carga (peso × reps) | peso_corporal (peso corporal + lastre) | tiempo | cardio
const LISTA = [
  ['Barbell_Bench_Press_-_Medium_Grip', 'Press de banca con barra', 'carga'],
  ['Dumbbell_Bench_Press', 'Press de banca con mancuernas', 'carga'],
  ['Incline_Dumbbell_Press', 'Press inclinado con mancuernas', 'carga'],
  ['Butterfly', 'Aperturas en máquina (contractora)', 'carga'],
  ['Pushups', 'Flexiones', 'peso_corporal'],
  ['Dips_-_Triceps_Version', 'Fondos en paralelas', 'peso_corporal'],
  ['Pullups', 'Dominadas', 'peso_corporal'],
  ['Wide-Grip_Lat_Pulldown', 'Jalón al pecho agarre ancho', 'carga'],
  ['Seated_Cable_Rows', 'Remo sentado en polea', 'carga'],
  ['Bent_Over_Barbell_Row', 'Remo con barra', 'carga'],
  ['One-Arm_Dumbbell_Row', 'Remo con mancuerna a una mano', 'carga'],
  ['Barbell_Deadlift', 'Peso muerto', 'carga'],
  ['Barbell_Squat', 'Sentadilla con barra', 'carga'],
  ['Leg_Press', 'Prensa de piernas', 'carga'],
  ['Leg_Extensions', 'Extensión de cuádriceps', 'carga'],
  ['Lying_Leg_Curls', 'Curl femoral tumbado', 'carga'],
  ['Standing_Calf_Raises', 'Elevación de gemelos de pie', 'carga'],
  ['Barbell_Hip_Thrust', 'Hip thrust con barra', 'carga'],
  ['Romanian_Deadlift', 'Peso muerto rumano', 'carga'],
  ['Dumbbell_Lunges', 'Zancadas con mancuernas', 'carga'],
  ['Standing_Military_Press', 'Press militar con barra', 'carga'],
  ['Dumbbell_Shoulder_Press', 'Press de hombros con mancuernas', 'carga'],
  ['Side_Lateral_Raise', 'Elevaciones laterales', 'carga'],
  ['Reverse_Machine_Flyes', 'Pájaros en máquina', 'carga'],
  ['Barbell_Curl', 'Curl con barra', 'carga'],
  ['Hammer_Curls', 'Curl martillo', 'carga'],
  ['Triceps_Pushdown', 'Extensión de tríceps en polea', 'carga'],
  ['EZ-Bar_Skullcrusher', 'Press francés con barra Z', 'carga'],
  ['Plank', 'Plancha', 'tiempo'],
  ['Crunches', 'Encogimientos abdominales', 'peso_corporal'],
  ['Hanging_Leg_Raise', 'Elevación de piernas colgado', 'peso_corporal'],
  ['Running_Treadmill', 'Cinta de correr', 'cardio'],
  ['Bicycling_Stationary', 'Bicicleta estática', 'cardio'],
  ['Rowing_Stationary', 'Remo ergómetro', 'cardio'],
  ['Elliptical_Trainer', 'Elíptica', 'cardio'],
  ['Stairmaster', 'Escaladora', 'cardio'],
];

const todos = Object.fromEntries((await (await fetch(FUENTE)).json()).map((e) => [e.id, e]));
const m = (xs) => xs.map((x) => MUSCULOS[x]);

const catalogo = LISTA.map(([id, nombre, registro]) => {
  const e = todos[id];
  if (!e) throw new Error(`No existe en free-exercise-db: ${id}`);
  return {
    id: `cat:${id.toLowerCase()}`,
    nombre,
    registro,
    equipo: registro === 'cardio' ? 'cardio' : EQUIPO[e.equipment],
    musculos_principales: m(e.primaryMuscles),
    musculos_secundarios: m(e.secondaryMuscles),
    id_origen: id,
    imagenes_origen: e.images,
  };
});

writeFileSync('assets/data/ejercicios.json', JSON.stringify(catalogo, null, 2) + '\n');
console.log(`${catalogo.length} ejercicios`);
