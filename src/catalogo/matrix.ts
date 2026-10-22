/**
 * Máquinas de Matrix Fitness (series Aura G3, Ultra G7, Versa, Go, Magnum, Varsity y Xult; matrixfitness.com, octubre de 2026).
 * - Las que hacen un ejercicio que ya está en el catálogo: su nombre (el que lleva la máquina) como alias de esa variante.
 * - Las que hacen un movimiento distinto: variantes o ejercicios nuevos, con su ilustración y técnica propia.
 * Lista completa de nombres en lista-matrix.json (el test comprueba que todos se encuentran con el buscador).
 */
import type { Equipo, Familia, Variante } from './datos';
import type { Registro } from '@/domain/calculos';

const v = (id: string, nombre: string, en: string, equipo: Equipo[], registro: Registro, pose: string, extra: Partial<Variante> = {}): Variante => ({
  id: `cat:${id}`,
  nombre,
  en,
  equipo,
  registro,
  pose,
  ...extra,
});

/** Nombres de máquina para variantes que ya existen (por id de variante). */
export const ALIAS_MATRIX: Record<string, string[]> = {
  'cat:chest_press_machine': ['Converging Chest Press', 'Vertical Bench Press', 'Supine Bench Press', 'Multi-Press', 'Press convergente'],
  'cat:barbell_bench_press_-_medium_grip': ['Olympic Flat Bench', 'Flat Bench', 'Power Rack', 'Half Rack'],
  'cat:dumbbell_bench_press': ['Utility Bench', 'Multi-Adjustable Bench'],
  'cat:incline_dumbbell_press': ['Adjustable Bench', 'Multi-Adjustable Bench'],
  'cat:smith_chest_press': ['Smith Machine', 'Angled Smith Machine'],
  'cat:butterfly': ['Pec Fly', 'Pectoral Fly / Rear Delt', 'Rear Delt / Pec Fly', 'Decline Pec Fly'],
  'cat:dap_crossover': ['Adjustable Cable Crossover', 'Cable Crossover', 'Functional Trainer', 'Adjustable Pulley'],
  'cat:dap_bar_press': ['Functional Trainer', 'Adjustable Pulley'],
  'cat:shoulder_press_machine': ['Converging Shoulder Press'],
  'cat:reverse_machine_flyes': ['Rear Delt / Pec Fly', 'Pectoral Fly / Rear Delt', 'Rear Delt'],
  'cat:wide-grip_lat_pulldown': ['Diverging Lat Pulldown', 'Lat Pulldown / Seated Row', 'Jalón divergente'],
  'cat:row_machine': ['Seated Row', 'Diverging Seated Row', 'Lat Pulldown / Seated Row', 'Lever Row', 'Low Row', 'Remo divergente'],
  'cat:seated_cable_rows': ['Seated Row', 'Low Row', 'Lat Pulldown / Low Row'],
  'cat:bent_over_barbell_row': ['T-Bar Row', 'Remo en T'],
  'cat:biceps_machine': ['Arm Curl', 'Independent Biceps Curl', 'Dependent Arm Curl', 'Elevated Biceps Curl', 'Bicep / Tricep'],
  'cat:triceps_machine': ['Triceps Press', 'Seated Triceps Press'],
  'cat:triceps_pushdown': ['Triceps Pushdown', 'Triceps Pressdown'],
  'cat:ab_crunch_machine': ['Abdominal', 'Abdominal / Back Extension', 'Ab Crunch Bench'],
  'cat:situp': ['Adjustable Ab Bench', 'Adjustable Decline Bench', 'Sit-up en banco declinado'],
  'cat:cable_ab_rotation': ['Rotary Torso'],
  'cat:pullups': ['VKR with Chin', 'Power Station'],
  'cat:ab_knee_raise': ['VKR with Chin', 'Power Station', 'Vertical Knee Raise', 'Captain chair'],
  'cat:leg_press': ['45-Degree Leg Press', 'Leg Press / Calf Press'],
  'cat:leg_extensions': ['Reclining Leg Extension', 'Leg Extension / Leg Curl', 'Leg Extension / Seated Leg Curl'],
  'cat:seated_leg_curl': ['Seated Leg Curl', 'Leg Curl', 'Leg Extension / Leg Curl', 'Leg Extension / Seated Leg Curl'],
  'cat:lying_leg_curls': ['Prone Leg Curl', 'Lying Leg Curl'],
  'cat:standing_leg_curl': ['Kneeling Leg Curl'],
  'cat:eccentric_hamstring': ['Glute Ham Bench', 'Glute ham raise', 'GHD'],
  'cat:standing_calf_raises': ['Calf Extension', 'Standing Calf'],
  'cat:standing_hip_abduction': ['Standing Hip Abductor', 'Rotary Hip'],
  'cat:glute_kickback': ['Glute', 'Rotary Hip'],
  'cat:barbell_squat': ['Squat Rack', 'Power Rack', 'Half Rack'],
  'cat:smith_squat': ['Smith Machine', 'Angled Smith Machine'],
  'cat:running_treadmill': ['Matrix Treadmill'],
  'cat:elliptical_trainer': ['Ascent Trainer', 'Lower Body Ascent Trainer'],
  'cat:stairmaster': ['ClimbMill', 'Stepper'],
  'cat:bicycling_stationary': ['Upright Cycle'],
  'cat:recumbent_bike': ['Recumbent Cycle'],
  'cat:rowing_stationary': ['Matrix Rower'],
};

const ENCASTRE = ['Ajusta el asiento para que el eje de la máquina quede a la altura de la articulación que se mueve.'];

/** Variantes nuevas de ejercicios que ya existen (por id de familia). */
export const VARIANTES_MATRIX: Record<string, Variante[]> = {
  press_pecho: [
    v('incline_chest_press_machine', 'Inclinado en máquina', 'Incline chest press machine', ['maquina'], 'carga', 'press_inclinado_maquina', {
      alias: ['Incline Bench Press', 'Incline Press'], secundarios: ['hombros', 'triceps'],
      ajustes: ['Ajusta el asiento para que los agarres queden a la altura de la parte alta del pecho.'],
    }),
    v('incline_barbell_press', 'Inclinado con barra', 'Barbell incline bench press', ['barra', 'banco'], 'carga', 'press_inclinado_barra', {
      alias: ['Olympic Incline Bench'], secundarios: ['hombros', 'triceps'],
      ajustes: ['Respaldo a 30–45°; la barra baja a la parte alta del pecho.'],
    }),
    v('decline_chest_press_machine', 'Declinado en máquina', 'Decline chest press machine', ['maquina'], 'carga', 'press_declinado_maquina', {
      alias: ['Vertical Decline Bench Press', 'Decline Press'],
      nota: 'Empuja hacia delante y abajo: trabaja más la parte baja del pecho.',
    }),
    v('decline_barbell_press', 'Declinado con barra', 'Barbell decline bench press', ['barra', 'banco'], 'carga', 'press_declinado_barra', {
      alias: ['Olympic Decline Bench'],
      ajustes: ['Engancha bien los pies en los rodillos antes de sacar la barra; usa topes o un compañero.'],
      ejecucion: ['Con la cabeza más baja que la cadera, saca la barra con los brazos estirados sobre el pecho.', 'Bájala controlada hasta la parte baja del pecho.', 'Empuja hasta estirar los brazos sin bloquear los codos de golpe.'],
    }),
  ],
  press_hombros: [
    v('seated_barbell_shoulder_press', 'Sentado con barra', 'Seated barbell shoulder press', ['barra', 'banco'], 'carga', 'press_hombros_barra_sentado', {
      alias: ['Olympic Shoulder Bench'],
      ajustes: ['Ajusta el asiento para sacar la barra de los soportes con los brazos algo flexionados.'],
    }),
  ],
  elevaciones: [
    v('lateral_raise_machine', 'Laterales en máquina', 'Lateral raise machine', ['maquina'], 'carga', 'elevacion_lateral_maquina', {
      alias: ['Lateral Raise'],
      ajustes: ['Ajusta el asiento para que el hombro quede alineado con el eje de giro de la máquina.'],
      ejecucion: ['Apoya los antebrazos o los codos en las almohadillas, con la espalda pegada al respaldo.', 'Sube los codos hacia los lados hasta la altura de los hombros.', 'Baja despacio sin dejar que las placas choquen.'],
      errores: ['Encoger los hombros hacia las orejas.', 'Inclinarse hacia un lado para subir más peso.'],
    }),
  ],
  remo: [
    v('high_row_machine', 'Remo alto en máquina', 'High row machine', ['maquina'], 'carga', 'remo_alto_maquina', {
      alias: ['High Row'], principales: ['dorsales', 'espalda_media'],
      ejecucion: ['Agarra las asas por encima de la cabeza, con el pecho apoyado.', 'Tira hacia abajo y atrás llevando los codos junto al cuerpo.', 'Vuelve despacio hasta estirar los brazos.'],
    }),
  ],
  curl_biceps: [
    v('preacher_curl', 'En banco Scott', 'Preacher curl', ['barra_z', 'banco'], 'carga', 'curl_scott', {
      alias: ['Preacher Curl', 'Standing Arm Curl', 'Curl Scott', 'Curl predicador'],
      ajustes: ['Ajusta el asiento para que la axila quede en el borde superior del cojín.'],
      ejecucion: ['Apoya la parte de atrás de los brazos en el cojín con los codos casi estirados.', 'Sube la barra doblando los codos sin despegar los brazos.', 'Baja despacio sin estirar del todo de golpe.'],
    }),
  ],
  press_frances: [
    v('triceps_extension_machine', 'En máquina', 'Triceps extension machine', ['maquina'], 'carga', 'triceps_extension_maquina', {
      alias: ['Triceps Extension', 'Bicep / Tricep'],
      ajustes: ENCASTRE,
      ejecucion: ['Apoya los codos en la almohadilla, a la altura del eje de la máquina.', 'Estira los codos empujando las asas hasta casi bloquear.', 'Vuelve despacio hasta que los antebrazos pasen de la vertical.'],
      errores: ['Levantar los codos de la almohadilla.', 'Ayudarse con el cuerpo.'],
    }),
  ],
  rotacion: [
    v('rotary_torso_machine', 'En máquina de rotación', 'Rotary torso machine', ['maquina'], 'carga', 'rotacion_maquina', {
      alias: ['Rotary Torso'],
      ejecucion: ['Siéntate con las piernas sujetas y el pecho contra el apoyo.', 'Gira el tronco hacia un lado contrayendo el abdomen, sin mover la cadera.', 'Vuelve despacio al centro; haz las mismas repeticiones a cada lado.'],
      errores: ['Girar con impulso.', 'Empezar con mucho recorrido o peso: la columna rota poco.'],
    }),
  ],
  dominadas: [
    v('assisted_pullup_machine', 'Asistidas en máquina', 'Assisted pull-up machine', ['maquina'], 'carga', 'dominada_asistida', {
      alias: ['Dip / Chin Assist', 'Chin / Dip Assist', 'Assisted Chin-up'],
      nota: 'Apunta como peso el contrapeso de ayuda: cuanto menos, más difícil.',
      ajustes: ['Elige el contrapeso: más peso = más ayuda.'],
    }),
  ],
  fondos: [
    v('assisted_dip_machine', 'Asistidos en máquina', 'Assisted dip machine', ['maquina'], 'carga', 'fondos_asistidos', {
      alias: ['Dip / Chin Assist', 'Chin / Dip Assist', 'Assisted Dip'],
      nota: 'Apunta como peso el contrapeso de ayuda: cuanto menos, más difícil.',
    }),
  ],
  gemelos: [
    v('calf_press_leg_press', 'En prensa', 'Calf press', ['maquina'], 'carga', 'gemelos_prensa', {
      alias: ['Calf Press', 'Leg Press / Calf Press'],
      ejecucion: ['En la prensa, apoya solo la punta de los pies en el borde de la plataforma con las piernas casi estiradas.', 'Empuja con la punta de los pies estirando los tobillos.', 'Vuelve despacio hasta notar estiramiento en el gemelo.'],
      errores: ['Doblar las rodillas para ayudarte.', 'Recorrido corto.'],
    }),
    v('seated_calf_machine', 'Sentado en máquina', 'Seated calf machine', ['maquina'], 'carga', 'gemelos_sentado_maquina', {
      alias: ['Seated Calf'],
      nota: 'Con la rodilla doblada trabaja más el sóleo.',
    }),
  ],
  aductores: [
    v('hip_adductor_machine', 'En máquina', 'Hip adductor machine', ['maquina'], 'carga', 'aduccion_maquina', {
      alias: ['Hip Adductor', 'Hip Adduction', 'Hip Abductor / Adductor', 'Adductor'],
      ajustes: ['Ajusta la apertura inicial a un recorrido cómodo, sin forzar.'],
      ejecucion: ['Siéntate con la espalda apoyada y las almohadillas por dentro de las rodillas.', 'Junta las piernas apretando los muslos.', 'Abre despacio hasta la posición inicial.'],
      errores: ['Abrir más de lo que permite tu movilidad.', 'Soltar el peso al volver.'],
    }),
  ],
  abduccion: [
    v('hip_abductor_machine', 'Sentado en máquina', 'Hip abductor machine', ['maquina'], 'carga', 'abduccion_maquina', {
      alias: ['Hip Abductor', 'Hip Abduction', 'Hip Abductor / Adductor', 'Abductor'],
      ejecucion: ['Siéntate con la espalda apoyada y las almohadillas por fuera de las rodillas.', 'Separa las piernas empujando con los glúteos.', 'Vuelve despacio sin dejar que las placas choquen.'],
      errores: ['Inclinarte hacia delante para ayudarte.', 'Movimiento brusco.'],
    }),
  ],
  sentadilla: [
    v('hack_squat', 'Hack en máquina', 'Hack squat', ['maquina'], 'carga', 'sentadilla_hack', {
      alias: ['Hack Squat', 'Pendulum Squat', 'Perfect Squat', 'Squat / Lunge', 'Sentadilla péndulo'],
      principales: ['cuadriceps'], secundarios: ['gluteos', 'aductores'],
      ajustes: ['Hombros bajo las almohadillas y espalda pegada al respaldo; pies a la anchura de la cadera en el centro de la plataforma.'],
      ejecucion: ['Quita el seguro y baja doblando las rodillas, que van en la dirección de los pies.', 'Baja hasta que los muslos queden al menos paralelos a la plataforma.', 'Empuja con toda la planta hasta casi estirar las piernas y vuelve a poner el seguro al terminar.'],
    }),
    v('belt_squat', 'Con cinturón (belt squat)', 'Belt squat', ['maquina'], 'carga', 'sentadilla_cinturon', {
      alias: ['Belt Squat'],
      nota: 'La carga va en la cadera: trabaja las piernas sin cargar la espalda.',
    }),
  ],
  zancada: [
    v('lever_lunge', 'En máquina de palanca', 'Lever squat lunge', ['maquina'], 'carga', 'zancada_maquina', { alias: ['Squat / Lunge'] }),
  ],
  puente_gluteo: [
    v('hip_thrust_machine', 'Hip thrust en máquina', 'Hip thrust machine', ['maquina'], 'carga', 'hip_thrust_maquina', {
      alias: ['Hip Thrust', 'Glute Trainer'],
      ajustes: ['Ajusta la almohadilla para que quede sobre la cadera, no sobre el abdomen.'],
      ejecucion: ['Espalda alta apoyada y pies firmes, con las rodillas a unos 90° arriba.', 'Sube la cadera apretando los glúteos hasta alinear tronco y muslos.', 'Baja controlado sin perder la tensión.'],
    }),
    v('standing_hip_thrust', 'De pie en máquina', 'Standing hip thrust', ['maquina'], 'carga', 'hip_thrust_pie', {
      alias: ['Standing Hip Thrust'], secundarios: ['isquios'],
      ejecucion: ['De pie con la almohadilla delante de la cadera y las rodillas algo flexionadas.', 'Echa la cadera atrás manteniendo la espalda recta.', 'Lleva la cadera hacia delante apretando los glúteos hasta quedar erguido.'],
      errores: ['Arquear la espalda al final en vez de apretar el glúteo.'],
    }),
  ],
};

const tecnicaLumbar = {
  ejecucion: ['Mantén la espalda recta y el cuello alineado durante todo el recorrido.', 'Extiende la cadera y la espalda hasta quedar alineado, sin pasarte hacia atrás.', 'Vuelve despacio a la posición inicial.'],
  errores: ['Hiperextender la espalda al final.', 'Hacerlo con impulso.'],
};

/** Ejercicios nuevos. */
export const FAMILIAS_MATRIX: Familia[] = [
  {
    id: 'extension_lumbar', nombre: 'Extensión lumbar', en: 'Back extension', categoria: 'core',
    principales: ['lumbar'], secundarios: ['gluteos', 'isquios'],
    tecnica: tecnicaLumbar,
    variantes: [
      v('back_extension_machine', 'En máquina', 'Back extension machine', ['maquina'], 'carga', 'lumbar_maquina', {
        alias: ['Back Extension', 'Abdominal / Back Extension'],
        ajustes: ['Ajusta el asiento para que la almohadilla quede a la altura de los omóplatos y la cadera, sobre el eje.'],
      }),
      v('back_extension_bench', 'En banco a 45°', '45° back extension', ['banco'], 'peso_corporal', 'hiperextension_45', {
        alias: ['Back Extension Bench', 'Back Trainer', 'Hiperextensiones', 'Hyperextension'],
        ajustes: ['El borde de la almohadilla, justo debajo de la cadera, para poder doblarte.'],
        nota: 'Con un disco en el pecho, apunta su peso como lastre.',
      }),
      v('reverse_back_extension', 'Inversa (piernas)', 'Reverse back extension', ['maquina', 'banco'], 'carga', 'hiperextension_inversa', {
        alias: ['Reverse Back Extension', 'Reverse Hyper', 'Hiperextensión inversa'], principales: ['gluteos', 'lumbar'], secundarios: ['isquios'],
        ejecucion: ['Túmbate boca abajo con la cadera en el borde y agárrate al banco.', 'Sube las piernas estiradas hasta alinearlas con el tronco.', 'Bájalas controladas, sin balancear.'],
      }),
    ],
  },
  {
    id: 'trineo', nombre: 'Empuje de trineo', en: 'Sled push', categoria: 'potencia',
    principales: ['cuadriceps', 'gluteos'], secundarios: ['gemelos', 'hombros', 'abdomen'],
    tecnica: {
      ejecucion: ['Agarra los postes con los brazos casi estirados y el cuerpo inclinado hacia delante.', 'Empuja con pasos cortos y potentes, apoyando la parte delantera del pie.', 'Mantén la espalda recta y la cadera baja durante todo el tramo.'],
      errores: ['Ponerse demasiado erguido.', 'Doblar mucho los brazos.'],
    },
    variantes: [v('sled_push', 'Empuje de trineo', 'Sled push', ['trineo'], 'carga', 'trineo', { alias: ['Push Sled', 'Prowler'], nota: 'Apunta el peso añadido y los tramos como repeticiones.' })],
  },
];

/** Añade alias, variantes y ejercicios de Matrix al catálogo base. */
export function conMatrix(base: Familia[]): Familia[] {
  const alias = (x: Variante): Variante => (ALIAS_MATRIX[x.id] ? { ...x, alias: [...new Set([...(x.alias ?? []), ...ALIAS_MATRIX[x.id]])] } : x);
  return [...base.map((f) => ({ ...f, variantes: [...f.variantes, ...(VARIANTES_MATRIX[f.id] ?? [])].map(alias) })), ...FAMILIAS_MATRIX];
}
