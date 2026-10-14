/**
 * Catálogo de ejercicios: familias (lo que se explica una vez: técnica, músculos) con sus
 * variantes (lo que se registra: cada una con su id, material y forma de registrar).
 * Los ids `cat:` antiguos se conservan para no perder el historial.
 * Textos de técnica propios. Nombres en inglés y alias: los de la lista de Technogym/Mywellness.
 */
import type { Registro } from '@/domain/calculos';

export type Categoria = 'empuje' | 'tiron' | 'piernas' | 'cadera' | 'core' | 'potencia' | 'pliometria' | 'cardio' | 'movilidad';
export type Equipo =
  | 'barra' | 'barra_z' | 'mancuerna' | 'kettlebell' | 'disco' | 'maquina' | 'polea' | 'polea_doble'
  | 'smith' | 'peso_corporal' | 'banco' | 'cajon' | 'barra_fija' | 'paralelas' | 'rueda' | 'cardio';

export type Tecnica = { ajustes?: string[]; ejecucion: string[]; errores: string[] };

export type Variante = {
  id: string;
  nombre: string; // la variante en español ("Máquina", "Con mancuernas"…)
  en: string; // nombre completo en inglés
  alias?: string[]; // otros nombres (inglés o español) para el buscador
  equipo: Equipo[];
  registro: Registro;
  pose: string; // clave en ilustracion/poses.ts
  nota?: string; // en qué cambia respecto a la familia
  principales?: string[];
  secundarios?: string[];
} & Partial<Tecnica>;

export type Familia = {
  id: string;
  nombre: string;
  en: string;
  categoria: Categoria;
  principales: string[];
  secundarios: string[];
  tecnica: Tecnica;
  variantes: Variante[];
};

export const CATEGORIAS: { id: Categoria; nombre: string }[] = [
  { id: 'empuje', nombre: 'Empuje' },
  { id: 'tiron', nombre: 'Tirón' },
  { id: 'piernas', nombre: 'Piernas' },
  { id: 'cadera', nombre: 'Cadera y glúteo' },
  { id: 'core', nombre: 'Core' },
  { id: 'potencia', nombre: 'Potencia' },
  { id: 'pliometria', nombre: 'Saltos y HIIT' },
  { id: 'cardio', nombre: 'Cardio' },
  { id: 'movilidad', nombre: 'Movilidad' },
];

export const EQUIPOS: { id: Equipo; nombre: string }[] = [
  { id: 'peso_corporal', nombre: 'Peso corporal' },
  { id: 'mancuerna', nombre: 'Mancuernas' },
  { id: 'barra', nombre: 'Barra' },
  { id: 'barra_z', nombre: 'Barra Z' },
  { id: 'kettlebell', nombre: 'Kettlebell' },
  { id: 'disco', nombre: 'Disco' },
  { id: 'maquina', nombre: 'Máquina' },
  { id: 'polea', nombre: 'Polea' },
  { id: 'polea_doble', nombre: 'Polea doble' },
  { id: 'smith', nombre: 'Smith' },
  { id: 'banco', nombre: 'Banco' },
  { id: 'cajon', nombre: 'Cajón' },
  { id: 'barra_fija', nombre: 'Barra de dominadas' },
  { id: 'paralelas', nombre: 'Paralelas' },
  { id: 'rueda', nombre: 'Rueda' },
  { id: 'cardio', nombre: 'Máquina de cardio' },
];

const v = (id: string, nombre: string, en: string, equipo: Equipo[], registro: Registro, pose: string, extra: Partial<Variante> = {}): Variante => ({
  id: id.startsWith('cat:') ? id : `cat:${id}`,
  nombre,
  en,
  equipo,
  registro,
  pose,
  ...extra,
});

/** Familia con una sola variante (mismo id y nombre). */
const sola = (id: string, nombre: string, en: string, categoria: Categoria, principales: string[], secundarios: string[], equipo: Equipo[], registro: Registro, pose: string, tecnica: Tecnica, extra: Partial<Variante> = {}): Familia => ({
  id, nombre, en, categoria, principales, secundarios, tecnica,
  variantes: [v(id, nombre, en, equipo, registro, pose, extra)],
});

export const FAMILIAS: Familia[] = [
  // ───────────── EMPUJE ─────────────
  {
    id: 'press_pecho', nombre: 'Press de pecho', en: 'Chest press', categoria: 'empuje',
    principales: ['pecho'], secundarios: ['triceps', 'hombros'],
    tecnica: {
      ejecucion: ['Escápulas juntas y hacia abajo, pecho alto y pies firmes.', 'Baja el peso controlado hasta la altura del pecho, con los codos a unos 45° del cuerpo.', 'Empuja hasta casi estirar los brazos, soltando el aire.'],
      errores: ['Abrir los codos a 90°: carga el hombro.', 'Rebotar o acortar el recorrido.', 'Despegar la espalda o los glúteos del apoyo.'],
    },
    variantes: [
      v('cat:barbell_bench_press_-_medium_grip', 'Con barra en banco', 'Barbell bench press', ['barra', 'banco'], 'carga', 'press_banca', {
        alias: ['Bench press', 'Press de banca'],
        ajustes: ['Túmbate con los ojos bajo la barra y ajusta los soportes para sacarla con los brazos casi estirados.', 'Usa topes de seguridad o un compañero si vas a cargar cerca de tu máximo.'],
        ejecucion: ['Agarre algo más ancho que los hombros, muñecas rectas sobre los codos.', 'Junta las escápulas, saca pecho y apoya bien los pies en el suelo.', 'Baja la barra controlada hasta rozar la parte baja del pecho, con los codos a unos 45° del cuerpo.', 'Empuja hacia arriba y ligeramente hacia la cara hasta estirar los brazos, soltando el aire.'],
      }),
      v('cat:dumbbell_bench_press', 'Con mancuernas en banco', 'Dumbbell chest press', ['mancuerna', 'banco'], 'carga', 'press_banca_mancuernas', {
        alias: ['Dumbbell bench press'],
        ejecucion: ['Siéntate con las mancuernas sobre los muslos y túmbate llevándolas al pecho.', 'Escápulas juntas, pies firmes; mancuernas a la altura del pecho con los codos algo por debajo del banco.', 'Empuja hacia arriba hasta que casi se toquen, sin chocarlas.', 'Baja despacio hasta notar estiramiento en el pecho.'],
      }),
      v('cat:incline_dumbbell_press', 'Inclinado con mancuernas', 'Dumbbell incline press', ['mancuerna', 'banco'], 'carga', 'press_inclinado', {
        alias: ['Incline dumbbell press'], secundarios: ['hombros', 'triceps'],
        ajustes: ['Inclina el respaldo entre 30° y 45°; más inclinación carga más el hombro.'],
      }),
      v('chest_press_machine', 'En máquina', 'Chest press machine', ['maquina'], 'carga', 'press_pecho_maquina', {
        alias: ['Chest press'],
        ajustes: ['Ajusta el asiento para que los agarres queden a la altura de la mitad del pecho.', 'Si la máquina tiene pedal o palanca de inicio, úsalo para no empezar con el hombro estirado.'],
      }),
      v('smith_chest_press', 'En máquina Smith', 'Smith machine chest press', ['smith', 'banco'], 'carga', 'press_banca_smith', {
        ajustes: ['Coloca el banco para que la barra baje a la parte baja del pecho.', 'Ajusta los topes de seguridad justo por encima del pecho.'],
      }),
      v('smith_incline_press', 'Inclinado en Smith', 'Smith machine incline chest press', ['smith', 'banco'], 'carga', 'press_inclinado_smith', {
        ajustes: ['Respaldo a 30–45°, con la barra bajando a la parte alta del pecho.'],
      }),
      v('cable_press_one_hand', 'De pie en polea, a una mano', 'Cable press one hand', ['polea'], 'carga', 'press_polea_una', {
        nota: 'De pie, de espaldas a la polea y con un pie adelantado; el abdomen evita que el tronco gire.', secundarios: ['triceps', 'hombros', 'abdomen'],
      }),
      v('dap_bar_press', 'Con barra en polea doble', 'Dap bar press', ['polea_doble'], 'carga', 'press_polea_barra', {
        nota: 'De pie, de espaldas a la polea doble con la barra a la altura del pecho; empuja al frente.',
      }),
    ],
  },
  {
    id: 'aperturas', nombre: 'Aperturas', en: 'Chest fly', categoria: 'empuje',
    principales: ['pecho'], secundarios: ['hombros'],
    tecnica: {
      ejecucion: ['Codos ligeramente flexionados y fijos durante todo el movimiento.', 'Abre los brazos hasta notar estiramiento en el pecho, sin dolor en el hombro.', 'Junta los brazos delante del pecho en un arco amplio y aprieta un segundo.'],
      errores: ['Doblar y estirar los codos: se convierte en un press.', 'Abrir más de lo cómodo.', 'Dejar caer el peso en la vuelta.'],
    },
    variantes: [
      v('cat:butterfly', 'En máquina (contractora)', 'Pec deck (butterfly)', ['maquina'], 'carga', 'aperturas_maquina', {
        alias: ['Butterfly', 'Pectoral fly'],
        ajustes: ['Ajusta el asiento para que los brazos queden a la altura del pecho, con los codos un poco por debajo de los hombros.', 'Elige la posición inicial de los brazos: debes notar estiramiento en el pecho, nunca molestia en el hombro.'],
      }),
      v('dumbbell_fly', 'Con mancuernas en banco', 'Dumbbell fly', ['mancuerna', 'banco'], 'carga', 'aperturas_mancuernas', { alias: ['Flyes', 'Dumbbell flyes'] }),
      v('dap_crossover', 'Cruce en polea doble', 'Dap crossover', ['polea_doble'], 'carga', 'cruce_polea', {
        alias: ['Cable crossover'], nota: 'De pie entre las dos poleas, altas o a media altura, con un pie adelantado.',
      }),
    ],
  },
  {
    id: 'flexiones', nombre: 'Flexiones', en: 'Push-up', categoria: 'empuje',
    principales: ['pecho'], secundarios: ['triceps', 'hombros', 'abdomen'],
    tecnica: {
      ejecucion: ['Manos algo más anchas que los hombros, cuerpo en línea de la cabeza a los talones.', 'Aprieta abdomen y glúteos.', 'Baja hasta que el pecho casi toque el suelo, con los codos a unos 45° del cuerpo.', 'Empuja el suelo hasta estirar los brazos.'],
      errores: ['Dejar caer la cadera o subirla en pico.', 'Bajar solo la cabeza.', 'Recorrido corto.'],
    },
    variantes: [
      v('cat:pushups', 'Clásicas', 'Push-up', ['peso_corporal'], 'peso_corporal', 'flexion', { alias: ['Pushup', 'Push up', 'Push ups'] }),
      v('knee_pushup', 'De rodillas', 'Knee push-up', ['peso_corporal'], 'peso_corporal', 'flexion_rodillas', { alias: ['Knee push ups', 'Knee pushup'], nota: 'Apoya las rodillas; mantén la línea de rodillas a cabeza.' }),
      v('diamond_pushup', 'Diamante', 'Diamond push-ups', ['peso_corporal'], 'peso_corporal', 'flexion', { alias: ['Diamond push ups'], nota: 'Manos juntas bajo el pecho formando un rombo con pulgares e índices.', principales: ['triceps', 'pecho'], secundarios: ['hombros'] }),
      v('triceps_pushup', 'Cerradas (tríceps)', 'Triceps push-up', ['peso_corporal'], 'peso_corporal', 'flexion', { alias: ['Triceps pushup'], nota: 'Manos al ancho de los hombros y codos pegados al cuerpo.', principales: ['triceps'], secundarios: ['pecho', 'hombros'] }),
      v('inverted_pushup', 'Invertidas (en pica)', 'Inverted push-ups', ['peso_corporal'], 'peso_corporal', 'flexion_pica', { alias: ['Inverted push ups', 'Pike push-up'], nota: 'Cadera alta en V invertida; baja la cabeza entre las manos.', principales: ['hombros'], secundarios: ['triceps', 'pecho'] }),
      v('pushup_hold', 'Isométrica', 'Push-up hold', ['peso_corporal'], 'tiempo', 'flexion_mantener', { alias: ['Push up hold'], nota: 'Aguanta abajo, con el pecho a un palmo del suelo.' }),
      v('pushup_rotation', 'Con rotación', 'Push-up with rotation', ['peso_corporal'], 'peso_corporal', 'flexion_rotacion', { alias: ['Push up with rotation'], nota: 'Al subir, gira a plancha lateral levantando un brazo; alterna lados.', secundarios: ['triceps', 'hombros', 'abdomen'] }),
      v('pushup_crawl', 'Con desplazamiento (gateo)', 'Push-ups crawl', ['peso_corporal'], 'peso_corporal', 'flexion', { alias: ['Push ups crawl'], nota: 'Entre flexión y flexión, avanza a cuatro patas con las rodillas sin tocar el suelo.' }),
      v('pushup_walk', 'Caminando con las manos', 'Push-up walk', ['peso_corporal'], 'peso_corporal', 'flexion', { alias: ['Pushup walk'], nota: 'Tras cada flexión, desplázate de lado con las manos y los pies.' }),
      v('box_pushup', 'En cajón, mano al pecho', 'Box push-up hand to chest', ['peso_corporal', 'cajon'], 'peso_corporal', 'flexion_cajon', { alias: ['Box push up mano al pecho'], nota: 'Manos en el cajón; arriba lleva una mano al pecho alternando lados.' }),
    ],
  },
  {
    id: 'fondos', nombre: 'Fondos', en: 'Dips', categoria: 'empuje',
    principales: ['triceps'], secundarios: ['pecho', 'hombros'],
    tecnica: {
      ejecucion: ['Brazos estirados y tronco vertical.', 'Baja doblando los codos, pegados al cuerpo, hasta que los brazos queden paralelos al suelo.', 'Empuja hasta estirar los brazos sin bloquear de golpe.'],
      errores: ['Bajar más de lo que permiten los hombros.', 'Encoger los hombros hacia las orejas.', 'Balancear las piernas para subir.'],
    },
    variantes: [
      v('cat:dips_-_triceps_version', 'En paralelas', 'Parallel bar dips', ['paralelas'], 'peso_corporal', 'fondos_paralelas', { alias: ['Dips'] }),
      v('box_dips', 'En banco o cajón', 'Box dips', ['banco', 'cajon'], 'peso_corporal', 'fondos_banco', { alias: ['Bench dips'], nota: 'Manos en el borde del cajón detrás de ti, piernas al frente; baja la cadera junto al cajón.' }),
      v('triceps_machine', 'En máquina', 'Triceps machine', ['maquina'], 'carga', 'fondos_maquina', { alias: ['Triceps press machine'], ajustes: ['Ajusta el asiento para que los agarres queden a la altura del pecho con los codos doblados.'] }),
    ],
  },
  {
    id: 'press_hombros', nombre: 'Press de hombros', en: 'Shoulder press', categoria: 'empuje',
    principales: ['hombros'], secundarios: ['triceps', 'trapecio'],
    tecnica: {
      ejecucion: ['Peso a la altura de los hombros, codos algo por delante del cuerpo.', 'Aprieta abdomen y glúteos para no arquear la espalda.', 'Empuja en vertical hasta casi estirar los brazos y baja controlado.'],
      errores: ['Arquear mucho la zona lumbar.', 'Empujar el peso hacia delante.', 'Bajar muy poco.'],
    },
    variantes: [
      v('cat:standing_military_press', 'Militar con barra', 'Military press', ['barra'], 'carga', 'press_militar', {
        alias: ['Overhead press'],
        ejecucion: ['Barra sobre la parte alta del pecho, agarre algo más ancho que los hombros.', 'Aprieta glúteos y abdomen para no arquear la espalda.', 'Empuja la barra en vertical apartando la cara y mete la cabeza bajo la barra al final.', 'Baja controlado al pecho.'],
      }),
      v('cat:dumbbell_shoulder_press', 'Con mancuernas', 'Dumbbell shoulder press', ['mancuerna', 'banco'], 'carga', 'press_hombros_mancuernas', { ajustes: ['En banco, respaldo vertical o casi vertical.'] }),
      v('shoulder_press_machine', 'En máquina', 'Shoulder press machine', ['maquina'], 'carga', 'press_hombros_maquina', { ajustes: ['Ajusta el asiento para que los agarres queden a la altura de los hombros.'] }),
      v('horizontal_shoulder_press', 'Horizontal en máquina', 'Horizontal shoulder press', ['maquina'], 'carga', 'press_hombros_horizontal', { alias: ['Hotizontal shoulder press'], nota: 'Empuje hacia delante y arriba, a medio camino entre press de pecho y de hombros.', secundarios: ['triceps', 'pecho'] }),
      v('smith_shoulder_press', 'En máquina Smith', 'Smith machine shoulder press', ['smith', 'banco'], 'carga', 'press_hombros_smith', { ajustes: ['Banco vertical bajo la barra; la barra baja por delante de la cara hasta la barbilla.'] }),
      v('push_press', 'Push press con barra', 'Push press', ['barra'], 'carga', 'push_press', { nota: 'Flexiona un poco las rodillas y extiéndelas con fuerza para impulsar la barra; termina con los brazos.', secundarios: ['triceps', 'cuadriceps', 'gluteos'] }),
      v('kb_push_press', 'Push press con kettlebells', 'Kettlebell push press', ['kettlebell'], 'carga', 'push_press_kb', { secundarios: ['triceps', 'cuadriceps', 'gluteos'] }),
      v('kb_push_press_one', 'Push press con kettlebell a una mano', 'Kettlebell push press one hand', ['kettlebell'], 'carga', 'push_press_kb', { secundarios: ['triceps', 'cuadriceps', 'abdomen'] }),
    ],
  },
  {
    id: 'elevaciones', nombre: 'Elevaciones de hombro', en: 'Shoulder raise', categoria: 'empuje',
    principales: ['hombros'], secundarios: ['trapecio'],
    tecnica: {
      ejecucion: ['De pie, codos ligeramente flexionados.', 'Sube los brazos hasta la altura de los hombros.', 'Baja despacio sin dejar caer el peso.'],
      errores: ['Balancear el cuerpo.', 'Subir por encima de los hombros encogiéndolos.', 'Usar tanto peso que se doblan los codos.'],
    },
    variantes: [
      v('cat:side_lateral_raise', 'Laterales con mancuernas', 'Lateral raise', ['mancuerna'], 'carga', 'elevacion_lateral', { alias: ['Side lateral raise'] }),
      v('front_raise', 'Frontales', 'Front raise', ['mancuerna', 'disco'], 'carga', 'elevacion_frontal', { nota: 'Sube los brazos al frente hasta la altura de los ojos.' }),
      v('dap_bar_y', 'En Y con barra en polea doble', 'Dap bar dynamic Y', ['polea_doble'], 'carga', 'elevacion_y_polea', { nota: 'De pie frente a las poleas bajas, sube la barra con los brazos abiertos en Y.', secundarios: ['trapecio', 'espalda_media'] }),
    ],
  },
  {
    id: 'pajaros', nombre: 'Pájaros', en: 'Reverse fly', categoria: 'tiron',
    principales: ['hombros'], secundarios: ['espalda_media', 'trapecio'],
    tecnica: {
      ejecucion: ['Brazos casi estirados al frente.', 'Abre los brazos hacia atrás hasta que queden en línea con los hombros.', 'Vuelve despacio.'],
      errores: ['Juntar mucho las escápulas: debe trabajar el hombro posterior.', 'Encoger los hombros.', 'Impulsarse con el tronco.'],
    },
    variantes: [
      v('cat:reverse_machine_flyes', 'En máquina', 'Reverse machine fly', ['maquina'], 'carga', 'pajaros_maquina', {
        ajustes: ['Siéntate de cara al respaldo con los brazos a la altura de los hombros.', 'Coloca los brazos de la máquina en la posición de inicio hacia delante.'],
      }),
      v('reverse_fly_db', 'Con mancuernas, inclinado', 'Reverse flies', ['mancuerna'], 'carga', 'pajaros_mancuernas', { nota: 'Tronco inclinado casi paralelo al suelo, espalda recta.' }),
      v('dap_back_crossover', 'Cruce inverso en polea doble', 'Dap back crossover', ['polea_doble'], 'carga', 'pajaros_polea', { nota: 'Con los cables cruzados, abre los brazos hacia atrás a la altura de los hombros.' }),
    ],
  },
  {
    id: 'triceps_polea', nombre: 'Extensión de tríceps en polea', en: 'Triceps pushdown', categoria: 'empuje',
    principales: ['triceps'], secundarios: [],
    tecnica: {
      ajustes: ['Polea en la posición más alta.'],
      ejecucion: ['De pie frente a la polea, codos pegados a los costados.', 'Estira los codos empujando hacia abajo hasta tener los brazos rectos.', 'Sube controlado hasta que los antebrazos queden algo por encima de la horizontal.'],
      errores: ['Separar los codos del cuerpo.', 'Echar el peso del cuerpo sobre el agarre.', 'Subir tanto que se mueven los hombros.'],
    },
    variantes: [
      v('cat:triceps_pushdown', 'Con barra', 'Triceps pushdown', ['polea'], 'carga', 'triceps_polea', { alias: ['Triceps high pulley'] }),
      v('cable_triceps_rope', 'Con cuerda', 'Cable triceps rope', ['polea'], 'carga', 'triceps_polea', { nota: 'Abajo, separa los extremos de la cuerda hacia fuera.' }),
      v('cable_triceps_single', 'A una mano', 'Cable triceps single handle', ['polea'], 'carga', 'triceps_polea', { nota: 'Agarre de una mano; trabaja un brazo y luego el otro.' }),
    ],
  },
  {
    id: 'press_frances', nombre: 'Extensión de tríceps con peso libre', en: 'Triceps extension', categoria: 'empuje',
    principales: ['triceps'], secundarios: ['antebrazos'],
    tecnica: {
      ejecucion: ['Brazos fijos; solo se mueven los codos.', 'Baja el peso doblando los codos hasta notar el estiramiento del tríceps.', 'Estira los codos para volver.'],
      errores: ['Mover los hombros: los brazos deben quedarse fijos.', 'Abrir los codos hacia fuera.', 'Bajar sin control.'],
    },
    variantes: [
      v('cat:ez-bar_skullcrusher', 'Press francés con barra Z', 'French press', ['barra_z', 'banco'], 'carga', 'press_frances', {
        alias: ['Skullcrusher', 'EZ-bar skullcrusher'],
        ejecucion: ['Tumbado en un banco con la barra Z sobre el pecho, brazos estirados.', 'Dobla solo los codos y baja la barra hacia la frente o justo por detrás de la cabeza.', 'Estira los codos para volver arriba.'],
      }),
      v('dumbbell_triceps', 'Con mancuerna por encima de la cabeza', 'Dumbbell triceps', ['mancuerna'], 'carga', 'triceps_nuca', { alias: ['Dumbbell overhead triceps extension'], nota: 'Sentado o de pie, mancuerna sujeta con las dos manos detrás de la cabeza.' }),
      v('db_kickback', 'Patada con mancuerna', 'Dumbbell triceps kickback', ['mancuerna', 'banco'], 'carga', 'patada_triceps', { nota: 'Tronco inclinado con apoyo en un banco; brazo pegado al cuerpo y estira el codo hacia atrás.', secundarios: [] }),
    ],
  },

  // ───────────── TIRÓN ─────────────
  {
    id: 'dominadas', nombre: 'Dominadas', en: 'Pull-up', categoria: 'tiron',
    principales: ['dorsales'], secundarios: ['biceps', 'espalda_media'],
    tecnica: {
      ejecucion: ['Colgado con los brazos estirados.', 'Lleva las escápulas hacia abajo antes de tirar.', 'Tira con los codos hacia las costillas hasta pasar la barbilla por encima de la barra.', 'Baja controlado hasta estirar los brazos.'],
      errores: ['Balancearse o dar patadas.', 'Hacer medio recorrido.', 'Adelantar la cabeza para llegar a la barra.'],
    },
    variantes: [
      v('cat:pullups', 'Agarre prono', 'Pull-ups', ['barra_fija'], 'peso_corporal', 'dominada', { alias: ['Pullups'] }),
      v('pullup_neutral', 'Agarre neutro', 'Pull-ups neutral handgrip', ['barra_fija'], 'peso_corporal', 'dominada', { alias: ['Pullups neutral handgrip'], nota: 'Palmas enfrentadas, en agarres paralelos.' }),
      v('chin_up', 'Agarre supino', 'Pull-ups supine handgrip', ['barra_fija'], 'peso_corporal', 'dominada', { alias: ['Chin-up', 'Pullups supine handgrip'], nota: 'Palmas hacia ti; trabaja más el bíceps.', secundarios: ['biceps', 'espalda_media'] }),
      v('dap_resistance_pullup', 'De pie en polea doble', 'Dap resistance pull up', ['polea_doble'], 'carga', 'dominada_polea', { nota: 'De rodillas o de pie bajo las poleas altas, tira de los agarres hacia abajo como en una dominada.' }),
    ],
  },
  {
    id: 'jalon', nombre: 'Jalón al pecho', en: 'Lat pulldown', categoria: 'tiron',
    principales: ['dorsales'], secundarios: ['biceps', 'espalda_media'],
    tecnica: {
      ajustes: ['Ajusta el rodillo para que sujete los muslos sin apretar.'],
      ejecucion: ['Tronco algo inclinado hacia atrás y pecho alto.', 'Baja el agarre hacia la parte alta del pecho llevando los codos hacia abajo y atrás.', 'Aprieta la espalda un instante y sube controlado hasta estirar los brazos.'],
      errores: ['Bajar la barra por detrás de la nuca.', 'Echarse muy atrás y tirar con el cuerpo.', 'Soltar la barra de golpe en la subida.'],
    },
    variantes: [v('cat:wide-grip_lat_pulldown', 'Agarre ancho', 'Lat pulldown', ['polea', 'maquina'], 'carga', 'jalon', { alias: ['Wide-grip lat pulldown'] })],
  },
  {
    id: 'remo', nombre: 'Remo', en: 'Row', categoria: 'tiron',
    principales: ['espalda_media', 'dorsales'], secundarios: ['biceps', 'hombros'],
    tecnica: {
      ejecucion: ['Espalda recta y pecho alto, brazos estirados.', 'Tira llevando los codos atrás y juntando las escápulas.', 'Vuelve despacio estirando los brazos sin redondear la espalda.'],
      errores: ['Balancear el tronco.', 'Redondear la espalda.', 'Subir los hombros hacia las orejas.'],
    },
    variantes: [
      v('cat:bent_over_barbell_row', 'Con barra, inclinado', 'Bar row', ['barra'], 'carga', 'remo_barra', {
        alias: ['Bent over barbell row'],
        ejecucion: ['Pies al ancho de la cadera, rodillas algo flexionadas.', 'Inclina el tronco hacia delante (unos 45° o más) con la espalda recta.', 'Tira de la barra hacia el ombligo, codos cerca del cuerpo.', 'Baja controlado sin cambiar la posición del tronco.'],
        secundarios: ['biceps', 'hombros', 'lumbar'],
      }),
      v('cat:one-arm_dumbbell_row', 'Con mancuerna a una mano en banco', 'Bench unilateral row', ['mancuerna', 'banco'], 'carga', 'remo_mancuerna', {
        alias: ['One-arm dumbbell row'],
        ejecucion: ['Apoya rodilla y mano del mismo lado en un banco, espalda paralela al suelo.', 'Con el otro brazo estirado, tira de la mancuerna hacia la cadera.', 'Lleva el codo atrás y aprieta la espalda; baja despacio hasta estirar.'],
      }),
      v('cat:seated_cable_rows', 'En polea, sentado', 'Cable row', ['polea'], 'carga', 'remo_polea', { alias: ['Seated cable row'], ajustes: ['Apoya los pies en la plataforma con las rodillas ligeramente flexionadas.'] }),
      v('row_machine', 'En máquina', 'Row machine', ['maquina'], 'carga', 'remo_maquina', { ajustes: ['Ajusta el apoyo del pecho para llegar a los agarres con los brazos estirados.'] }),
      v('smith_row', 'En máquina Smith', 'Smith machine row', ['smith'], 'carga', 'remo_smith', { nota: 'Como el remo con barra, con la barra guiada.' }),
      v('cable_pull_one', 'De pie en polea, a una mano', 'Cable pull one hand', ['polea'], 'carga', 'remo_polea_una', { nota: 'De pie frente a la polea con un pie adelantado; sin girar el tronco.', secundarios: ['biceps', 'abdomen'] }),
    ],
  },
  {
    id: 'pullover', nombre: 'Pullover', en: 'Pullover', categoria: 'tiron',
    principales: ['dorsales'], secundarios: ['pecho', 'triceps'],
    tecnica: {
      ejecucion: ['Brazos casi estirados por encima de la cabeza.', 'Lleva el peso en arco hasta la altura del pecho o de la cadera.', 'Vuelve despacio hasta notar el estiramiento.'],
      errores: ['Doblar los codos para mover el peso.', 'Arquear la zona lumbar al estirar.'],
    },
    variantes: [
      v('pullover_db', 'Con mancuerna en banco', 'Pullover', ['mancuerna', 'banco'], 'carga', 'pullover', { alias: ['Dumbbell pullover'] }),
      v('dap_pullover', 'De pie en polea doble', 'Dap pullover', ['polea_doble'], 'carga', 'pullover_polea', { alias: ['Cable pullover'], nota: 'Frente a las poleas altas, brazos estirados; baja los agarres hasta los muslos.' }),
    ],
  },
  {
    id: 'curl_biceps', nombre: 'Curl de bíceps', en: 'Biceps curl', categoria: 'tiron',
    principales: ['biceps'], secundarios: ['antebrazos'],
    tecnica: {
      ejecucion: ['De pie, codos pegados al cuerpo y fijos.', 'Sube doblando los codos hasta contraer el bíceps.', 'Baja despacio hasta estirar los brazos.'],
      errores: ['Balancear el tronco.', 'Adelantar los codos.', 'Bajar a medias.'],
    },
    variantes: [
      v('cat:barbell_curl', 'Con barra', 'Bar curl biceps', ['barra'], 'carga', 'curl_barra', { alias: ['Barbell curl'] }),
      v('db_curl', 'Con mancuernas', 'Dumbbell biceps', ['mancuerna'], 'carga', 'curl_mancuerna', { alias: ['Dumbbell curl'] }),
      v('cat:hammer_curls', 'Martillo', 'Dumbbell hammer biceps', ['mancuerna'], 'carga', 'curl_mancuerna', { alias: ['Hammer curls'], nota: 'Palmas mirando hacia el cuerpo, sin girar las muñecas.', secundarios: ['antebrazos'] }),
      v('biceps_machine', 'En máquina', 'Curl biceps', ['maquina'], 'carga', 'curl_maquina', { alias: ['Biceps curl machine'], ajustes: ['Ajusta el asiento para que el codo quede alineado con el eje de la máquina y el brazo apoyado.'] }),
      v('biceps_pulley', 'En polea con barra', 'Biceps pulley', ['polea'], 'carga', 'curl_polea', { alias: ['Cable biceps curl'] }),
      v('cable_biceps_rope', 'En polea con cuerda', 'Cable biceps rope', ['polea'], 'carga', 'curl_polea', { nota: 'Agarre neutro, como un curl martillo.' }),
      v('cable_biceps_single', 'En polea a una mano', 'Cable biceps single handle', ['polea'], 'carga', 'curl_polea', {}),
    ],
  },

  // ───────────── PIERNAS ─────────────
  {
    id: 'sentadilla', nombre: 'Sentadilla', en: 'Squat', categoria: 'piernas',
    principales: ['cuadriceps', 'gluteos'], secundarios: ['isquios', 'lumbar', 'aductores'],
    tecnica: {
      ejecucion: ['Pies algo más anchos que la cadera, puntas ligeramente abiertas.', 'Toma aire, tensa el abdomen y baja llevando la cadera atrás y las rodillas en la dirección de los pies.', 'Baja al menos hasta que el muslo quede paralelo al suelo y sube empujando con todo el pie.'],
      errores: ['Rodillas hacia dentro.', 'Levantar los talones.', 'Redondear la espalda abajo del todo.', 'Subir la cadera antes que el pecho.'],
    },
    variantes: [
      v('cat:barbell_squat', 'Con barra (trasera)', 'Back squat', ['barra'], 'carga', 'sentadilla_barra', {
        alias: ['Barbell squat'],
        ajustes: ['Coloca los soportes a la altura del pecho y los topes de seguridad un poco por debajo de tu punto más bajo.'],
        nota: 'Barra sobre la parte alta de la espalda, no sobre el cuello.',
      }),
      v('front_squat', 'Frontal con barra', 'Front squat', ['barra'], 'carga', 'sentadilla_frontal', { nota: 'Barra apoyada delante, sobre los hombros, con los codos altos; tronco más vertical.', principales: ['cuadriceps'], secundarios: ['gluteos', 'abdomen'] }),
      v('wide_back_squat', 'Amplia con barra (sumo)', 'Wide leg back squat', ['barra'], 'carga', 'sentadilla_barra', { nota: 'Pies muy separados y puntas hacia fuera; trabaja más aductores y glúteo.', principales: ['gluteos', 'cuadriceps', 'aductores'] }),
      v('squat_bw', 'Con peso corporal', 'Squat', ['peso_corporal'], 'peso_corporal', 'sentadilla', { alias: ['Air squat'] }),
      v('wide_squat', 'Amplia con peso corporal', 'Wide leg squat', ['peso_corporal'], 'peso_corporal', 'sentadilla', { principales: ['gluteos', 'cuadriceps', 'aductores'] }),
      v('smith_squat', 'En máquina Smith', 'Smith machine squat', ['smith'], 'carga', 'sentadilla_smith', { ajustes: ['Pies un poco por delante de la barra para bajar con el tronco más vertical.'] }),
      v('kb_squat', 'Con kettlebell (goblet)', 'Kettlebell squat', ['kettlebell'], 'carga', 'sentadilla_goblet', { alias: ['Goblet squat'], nota: 'Kettlebell sujeta delante del pecho, codos hacia abajo.' }),
      v('dap_squat', 'Con polea doble', 'Dap squat', ['polea_doble'], 'carga', 'sentadilla_polea', { nota: 'Agarres de las poleas bajas a los lados; baja y sube como en una sentadilla.' }),
      v('supported_squat', 'Asistida', 'Supported squat', ['peso_corporal'], 'peso_corporal', 'sentadilla_asistida', { nota: 'Agárrate a un soporte o a las asas de una polea para bajar más y con menos carga.' }),
      v('single_leg_squat', 'A una pierna (pistol)', 'Single leg squat', ['peso_corporal'], 'peso_corporal', 'sentadilla_una', { alias: ['Pistol squat'], nota: 'La otra pierna estirada al frente; empieza bajando a un cajón.', secundarios: ['isquios', 'abdomen'] }),
    ],
  },
  {
    id: 'sentadilla_salto', nombre: 'Sentadilla con salto', en: 'Squat jump', categoria: 'pliometria',
    principales: ['cuadriceps', 'gluteos'], secundarios: ['gemelos', 'isquios'],
    tecnica: {
      ejecucion: ['Baja a media sentadilla con los brazos atrás.', 'Salta lo más alto posible extendiendo cadera, rodillas y tobillos.', 'Aterriza suave con las rodillas flexionadas y encadena la siguiente.'],
      errores: ['Aterrizar con las piernas rígidas.', 'Rodillas hacia dentro al caer.'],
    },
    variantes: [
      v('squat_jump', 'Con peso corporal', 'Squat jump', ['peso_corporal'], 'peso_corporal', 'sentadilla_salto', { alias: ['Jump squat'] }),
      v('back_squat_jump', 'Con barra', 'Back squat jump', ['barra'], 'carga', 'sentadilla_salto_barra', { nota: 'Carga ligera (20–30 % de tu sentadilla).' }),
      v('wide_squat_jump', 'Amplia', 'Wide leg squat jump', ['peso_corporal'], 'peso_corporal', 'sentadilla_salto', { principales: ['gluteos', 'cuadriceps', 'aductores'] }),
      v('dap_jump_squat', 'Con polea doble', 'Dap jumping squat', ['polea_doble'], 'carga', 'sentadilla_salto_polea', { nota: 'Agarres de las poleas bajas como resistencia en el salto.' }),
    ],
  },
  {
    id: 'thruster', nombre: 'Thruster', en: 'Thruster', categoria: 'potencia',
    principales: ['cuadriceps', 'hombros'], secundarios: ['gluteos', 'triceps', 'abdomen'],
    tecnica: {
      ejecucion: ['Peso a la altura de los hombros.', 'Baja en sentadilla completa.', 'Sube con fuerza y aprovecha el impulso para empujar el peso por encima de la cabeza en un solo movimiento.'],
      errores: ['Separar la sentadilla y el press en dos movimientos.', 'Arquear la espalda arriba.'],
    },
    variantes: [
      v('thrusters', 'Con barra', 'Thrusters', ['barra'], 'carga', 'thruster', {}),
      v('kb_thrusters', 'Con kettlebells', 'Kettlebell thrusters', ['kettlebell'], 'carga', 'thruster_kb', {}),
    ],
  },
  {
    id: 'prensa', nombre: 'Prensa de piernas', en: 'Leg press', categoria: 'piernas',
    principales: ['cuadriceps'], secundarios: ['gluteos', 'isquios'],
    tecnica: {
      ajustes: ['Ajusta el respaldo para que, abajo del todo, la zona lumbar siga apoyada.', 'Quita los seguros de la plataforma solo cuando estés colocado.'],
      ejecucion: ['Pies en el centro de la plataforma, al ancho de la cadera.', 'Baja la plataforma doblando las rodillas en la dirección de los pies.', 'Para antes de que la pelvis se despegue del asiento y empuja con todo el pie.'],
      errores: ['Bloquear las rodillas de golpe arriba.', 'Bajar tanto que la zona lumbar se levanta.', 'Rodillas hacia dentro.'],
    },
    variantes: [v('cat:leg_press', 'En máquina', 'Leg press', ['maquina'], 'carga', 'prensa', {})],
  },
  {
    id: 'extension_cuadriceps', nombre: 'Extensión de cuádriceps', en: 'Leg extension', categoria: 'piernas',
    principales: ['cuadriceps'], secundarios: [],
    tecnica: {
      ejecucion: ['Espalda apoyada y agarre en las asas.', 'Estira las rodillas hasta casi bloquearlas y aprieta un segundo.', 'Baja despacio sin dejar que las placas choquen.'],
      errores: ['Dar impulso con la cadera.', 'Bajar de golpe.'],
    },
    variantes: [
      v('cat:leg_extensions', 'En máquina', 'Knee extension', ['maquina'], 'carga', 'extension_cuadriceps', {
        alias: ['Leg extensions'],
        ajustes: ['Alinea la rodilla con el eje de giro de la máquina.', 'Coloca el rodillo sobre el tobillo, no sobre el pie.'],
      }),
      v('standing_knee_extension', 'De pie en polea', 'Standing knee extension', ['polea'], 'carga', 'extension_cuadriceps_pie', { nota: 'Tobillera en la polea baja, de espaldas a ella; estira la rodilla con el muslo quieto.' }),
      v('eccentric_quad', 'Excéntrica', 'Eccentric quad', ['maquina'], 'carga', 'extension_cuadriceps', { nota: 'Sube con las dos piernas y baja con una sola, contando 3–4 s.' }),
    ],
  },
  {
    id: 'curl_femoral', nombre: 'Curl femoral', en: 'Leg curl', categoria: 'piernas',
    principales: ['isquios'], secundarios: ['gemelos'],
    tecnica: {
      ejecucion: ['Rodillas alineadas con el eje de giro y rodillo sobre los tobillos.', 'Dobla las rodillas llevando los talones hacia los glúteos.', 'Vuelve controlado hasta casi estirar.'],
      errores: ['Levantar la cadera para ayudarte.', 'Recorrido corto o rebotes.'],
    },
    variantes: [
      v('cat:lying_leg_curls', 'Tumbado en máquina', 'Lying leg curl', ['maquina'], 'carga', 'curl_femoral_tumbado', { ajustes: ['Rodillas justo fuera del borde del banco, alineadas con el eje de giro.'] }),
      v('seated_leg_curl', 'Sentado en máquina', 'Seated femoral curl', ['maquina'], 'carga', 'curl_femoral_sentado', { ajustes: ['Ajusta el respaldo para alinear la rodilla con el eje y baja la almohadilla sobre los muslos.'] }),
      v('standing_leg_curl', 'De pie', 'Standing femoral curl', ['maquina', 'polea'], 'carga', 'curl_femoral_pie', { nota: 'Una pierna cada vez, en máquina o con tobillera en la polea baja.' }),
      v('biceps_femoris_left', 'A una pierna, porción corta (izquierda)', 'Biceps femoris (short head) - left', ['maquina'], 'carga', 'curl_femoral_pie', { nota: 'Curl a una pierna con la punta del pie girada hacia fuera para insistir en la porción corta del bíceps femoral.' }),
      v('biceps_femoris_right', 'A una pierna, porción corta (derecha)', 'Biceps femoris (short head) - right', ['maquina'], 'carga', 'curl_femoral_pie', { nota: 'Curl a una pierna con la punta del pie girada hacia fuera para insistir en la porción corta del bíceps femoral.' }),
      v('eccentric_hamstring', 'Nórdico (excéntrico)', 'Eccentric hamstring', ['peso_corporal'], 'peso_corporal', 'nordico', { alias: ['Nordic curl'], nota: 'De rodillas con los tobillos sujetos; déjate caer hacia delante lo más despacio posible.' }),
    ],
  },
  {
    id: 'zancada', nombre: 'Zancada', en: 'Lunge', categoria: 'piernas',
    principales: ['cuadriceps', 'gluteos'], secundarios: ['isquios', 'aductores'],
    tecnica: {
      ejecucion: ['Da un paso largo y baja hasta que la rodilla de atrás casi toque el suelo.', 'La rodilla de delante va en la dirección del pie.', 'Empuja con el pie de delante para volver y cambia de pierna.'],
      errores: ['Paso demasiado corto: la rodilla se adelanta mucho.', 'Inclinar el tronco hacia delante.', 'Rodilla hacia dentro.'],
    },
    variantes: [
      v('lunge', 'Con peso corporal', 'Lunge', ['peso_corporal'], 'peso_corporal', 'zancada', {}),
      v('cat:dumbbell_lunges', 'Con mancuernas', 'Dumbbell lunge', ['mancuerna'], 'carga', 'zancada_mancuernas', { alias: ['Dumbbell lunges'] }),
      v('smith_lunge', 'En máquina Smith', 'Smith machine lunge', ['smith'], 'carga', 'zancada_smith', { nota: 'Zancada estática con la barra guiada.' }),
      v('dap_walking_lunge', 'Caminando con polea doble', 'Dap walking lunge', ['polea_doble'], 'carga', 'zancada_polea', {}),
      v('bulgarian_squat', 'Búlgara', 'Bulgarian squat', ['peso_corporal', 'banco'], 'peso_corporal', 'bulgara', { alias: ['Bulgarian split squat'], nota: 'Empeine de la pierna de atrás sobre un banco.' }),
      v('cable_reverse_lunge_rot', 'Atrás con polea y rotación', 'Cable reverse lunge + rotation', ['polea'], 'carga', 'zancada_rotacion', { nota: 'Paso atrás mientras giras el tronco hacia la pierna de delante tirando de la polea.', secundarios: ['abdomen', 'isquios'] }),
      v('cable_lunge_press', 'Con press a una mano en polea', 'Cable lunge + one arm press', ['polea'], 'carga', 'zancada_press', { nota: 'Al bajar en la zancada, empuja el agarre al frente con la mano contraria a la pierna adelantada.', secundarios: ['pecho', 'triceps', 'abdomen'] }),
      v('cable_lunge_pull', 'Con remo a una mano en polea', 'Cable lunge + one arm pull', ['polea'], 'carga', 'zancada_remo', { nota: 'Al bajar en la zancada, tira del agarre hacia la cadera.', secundarios: ['espalda_media', 'biceps', 'abdomen'] }),
      v('dap_bar_lunge_pull', 'Con barra en polea doble y rotación', 'Dap bar lunge + pull low rotation', ['polea_doble'], 'carga', 'zancada_rotacion', { nota: 'Zancada atrás tirando de la barra desde abajo en diagonal.', secundarios: ['abdomen', 'hombros'] }),
    ],
  },
  {
    id: 'step_up', nombre: 'Subida al cajón', en: 'Step-up', categoria: 'piernas',
    principales: ['cuadriceps', 'gluteos'], secundarios: ['isquios', 'gemelos'],
    tecnica: {
      ejecucion: ['Pie entero sobre el cajón, rodilla a unos 90°.', 'Empuja con la pierna de arriba hasta quedar de pie sobre el cajón.', 'Baja controlado con la misma pierna y alterna.'],
      errores: ['Impulsarte con la pierna de abajo.', 'Rodilla hacia dentro.'],
    },
    variantes: [v('db_step_up', 'Con mancuernas', 'Dumbbell step up', ['mancuerna', 'cajon'], 'carga', 'step_up', {})],
  },
  {
    id: 'gemelos', nombre: 'Elevación de talones', en: 'Calf raise', categoria: 'piernas',
    principales: ['gemelos'], secundarios: [],
    tecnica: {
      ejecucion: ['Apoya la parte delantera del pie en un escalón, talones fuera.', 'Baja los talones hasta notar estiramiento.', 'Sube todo lo posible sobre las puntas y aguanta un segundo.'],
      errores: ['Rebotar abajo.', 'Doblar las rodillas para empujar.', 'Hacer el recorrido a medias.'],
    },
    variantes: [
      v('cat:standing_calf_raises', 'De pie en máquina', 'Standing calf raise', ['maquina'], 'carga', 'gemelos_maquina', { ajustes: ['Ajusta las hombreras para estar de pie con las rodillas casi estiradas.'] }),
      v('ankle_extension', 'Con peso corporal', 'Ankle extension', ['peso_corporal'], 'peso_corporal', 'gemelos', {}),
      v('ankle_extension_one', 'A una pierna', 'Ankle extension 1 leg', ['peso_corporal'], 'peso_corporal', 'gemelos', {}),
      v('db_ankle_extension', 'Con mancuerna', 'Dumbbell ankle extension', ['mancuerna'], 'carga', 'gemelos_mancuerna', {}),
      v('smith_ankle_extension', 'De pie en Smith', 'Smith ankle extension', ['smith'], 'carga', 'gemelos_smith', {}),
      v('smith_seated_ankle_extension', 'Sentado en Smith', 'Smith seated ankle extension', ['smith', 'banco'], 'carga', 'gemelos_sentado', { nota: 'Sentado con la barra sobre los muslos, cerca de las rodillas; trabaja más el sóleo.' }),
    ],
  },
  {
    id: 'aductores', nombre: 'Aducción', en: 'Hip adduction', categoria: 'piernas',
    principales: ['aductores'], secundarios: ['abdomen'],
    tecnica: {
      ejecucion: ['Tumbado de lado, con el pie de arriba apoyado en un banco o sujeto por un compañero.', 'Sube la cadera hasta alinear el cuerpo.', 'Baja despacio, en 3–4 s.'],
      errores: ['Dejar caer la cadera de golpe.', 'Girar el tronco.'],
    },
    variantes: [v('eccentric_adductor', 'Excéntrica (Copenhague)', 'Eccentric adductor', ['peso_corporal', 'banco'], 'peso_corporal', 'copenhague', { alias: ['Copenhagen plank'] })],
  },
  {
    id: 'abduccion', nombre: 'Abducción de cadera', en: 'Hip abduction', categoria: 'cadera',
    principales: ['abductores', 'gluteos'], secundarios: [],
    tecnica: {
      ejecucion: ['De pie de lado a la polea baja, tobillera en el pie más alejado.', 'Separa la pierna hacia fuera sin inclinar el tronco.', 'Vuelve despacio.'],
      errores: ['Inclinar el tronco para subir más.', 'Girar la punta del pie hacia arriba.'],
    },
    variantes: [v('standing_hip_abduction', 'De pie en polea', 'Standing hip abduction', ['polea'], 'carga', 'abduccion', {})],
  },

  // ───────────── CADERA ─────────────
  {
    id: 'peso_muerto', nombre: 'Peso muerto', en: 'Deadlift', categoria: 'cadera',
    principales: ['isquios', 'gluteos', 'lumbar'], secundarios: ['cuadriceps', 'dorsales', 'trapecio', 'antebrazos'],
    tecnica: {
      ejecucion: ['Pies al ancho de la cadera con el peso sobre el medio del pie.', 'Agarra el peso, baja la cadera y estira la espalda.', 'Saca pecho, tensa el abdomen y empuja el suelo manteniendo el peso pegado al cuerpo.', 'Termina de pie con cadera y rodillas estiradas; baja con el mismo camino.'],
      errores: ['Redondear la espalda.', 'Alejar el peso de las piernas.', 'Subir primero la cadera y luego tirar con la espalda.', 'Echarse atrás al final del movimiento.'],
    },
    variantes: [
      v('cat:barbell_deadlift', 'Con barra', 'Deadlift', ['barra'], 'carga', 'peso_muerto', { alias: ['Barbell deadlift'] }),
      v('cat:romanian_deadlift', 'Rumano con barra', 'Romanian deadlift', ['barra'], 'carga', 'peso_muerto_rumano', {
        principales: ['isquios', 'gluteos'], secundarios: ['lumbar', 'antebrazos'],
        ejecucion: ['De pie con la barra en las manos, rodillas ligeramente flexionadas y fijas.', 'Lleva la cadera atrás y baja la barra pegada a los muslos con la espalda recta.', 'Baja hasta notar tensión fuerte en los isquios (suele ser por debajo de la rodilla).', 'Sube empujando la cadera hacia delante.'],
      }),
      v('kb_deadlift', 'Con kettlebell', 'Kettlebell deadlift', ['kettlebell'], 'carga', 'peso_muerto_kb', {}),
      v('deadlift_to_row', 'Con remo', 'Deadlift to row', ['barra', 'mancuerna'], 'carga', 'peso_muerto_remo', { nota: 'Sube del peso muerto, inclínate a 45° y haz un remo antes de volver a bajar.', secundarios: ['espalda_media', 'biceps'] }),
    ],
  },
  {
    id: 'puente_gluteo', nombre: 'Puente de glúteo', en: 'Glute bridge', categoria: 'cadera',
    principales: ['gluteos'], secundarios: ['isquios', 'lumbar'],
    tecnica: {
      ejecucion: ['Pies apoyados al ancho de la cadera, rodillas dobladas.', 'Empuja con los talones y sube la cadera hasta alinearla con tronco y rodillas.', 'Aprieta los glúteos arriba y baja controlado.'],
      errores: ['Arquear la zona lumbar en lugar de extender la cadera.', 'Pies demasiado lejos: trabaja más el isquio.'],
    },
    variantes: [
      v('shoulder_bridge', 'En el suelo', 'Shoulder bridge', ['peso_corporal'], 'peso_corporal', 'puente', { alias: ['Glute bridge'] }),
      v('shoulder_bridge_one', 'A una pierna', 'Shoulder bridge 1 leg', ['peso_corporal'], 'peso_corporal', 'puente_una', { nota: 'La otra pierna estirada en línea con el muslo.' }),
      v('cat:barbell_hip_thrust', 'Hip thrust con barra', 'Barbell hip thrust', ['barra', 'banco'], 'carga', 'hip_thrust', {
        alias: ['Hip thrust'], secundarios: ['isquios'],
        ejecucion: ['Apoya la parte baja de las escápulas en un banco, barra sobre la cadera (mejor con almohadilla).', 'Pies apoyados al ancho de la cadera, de modo que arriba las rodillas formen unos 90°.', 'Empuja con los talones y sube la cadera hasta alinearla con tronco y rodillas.', 'Aprieta los glúteos arriba y baja controlado.'],
      }),
    ],
  },
  {
    id: 'patada_gluteo', nombre: 'Patada de glúteo', en: 'Glute kickback', categoria: 'cadera',
    principales: ['gluteos'], secundarios: ['isquios'],
    tecnica: {
      ejecucion: ['Tronco quieto y abdomen firme.', 'Lleva la pierna hacia atrás extendiendo la cadera.', 'Vuelve despacio sin dejar que la zona lumbar se arquee.'],
      errores: ['Arquear la espalda para subir más.', 'Balancear la pierna.'],
    },
    variantes: [
      v('glute_kickback', 'En polea o máquina', 'Glute kickback', ['polea', 'maquina'], 'carga', 'patada_gluteo', { nota: 'De pie con tobillera en la polea baja, o en la máquina de glúteo.' }),
      v('leg_extended_kickback', 'Con la pierna estirada, en cuadrupedia', 'Leg extended kickback', ['peso_corporal'], 'peso_corporal', 'patada_cuadrupedia', {}),
    ],
  },
  {
    id: 'swing', nombre: 'Swing', en: 'Kettlebell swing', categoria: 'potencia',
    principales: ['gluteos', 'isquios'], secundarios: ['lumbar', 'hombros', 'abdomen', 'antebrazos'],
    tecnica: {
      ejecucion: ['Pies algo más anchos que la cadera, peso entre las piernas.', 'Lleva la cadera atrás con la espalda recta y el peso entre los muslos.', 'Extiende la cadera con fuerza: el impulso sube el peso hasta la altura del pecho.', 'Deja que baje y encadena.'],
      errores: ['Subir el peso con los brazos.', 'Hacer una sentadilla en lugar de llevar la cadera atrás.', 'Redondear la espalda abajo.'],
    },
    variantes: [
      v('kb_swing', 'Con kettlebell a dos manos', 'Kettlebell swing', ['kettlebell'], 'carga', 'swing', {}),
      v('kb_swing_one', 'Con kettlebell a una mano', 'Kettlebell swing one hand', ['kettlebell'], 'carga', 'swing', {}),
      v('kb_alt_swing', 'Alterno', 'Kettlebell alternative swing', ['kettlebell'], 'carga', 'swing', { nota: 'Cambia de mano arriba en cada repetición.' }),
      v('db_swing', 'Con mancuerna', 'Dumbbell swing', ['mancuerna'], 'carga', 'swing_mancuerna', {}),
    ],
  },
  {
    id: 'superman', nombre: 'Superman', en: 'Superman', categoria: 'core',
    principales: ['lumbar'], secundarios: ['gluteos', 'hombros'],
    tecnica: {
      ejecucion: ['Tumbado boca abajo con los brazos estirados al frente.', 'Levanta a la vez brazos, pecho y piernas unos centímetros.', 'Aguanta 1–2 s y baja.'],
      errores: ['Subir de golpe.', 'Echar la cabeza atrás.'],
    },
    variantes: [v('superman', 'En el suelo', 'Superman', ['peso_corporal'], 'peso_corporal', 'superman', {})],
  },

  // ───────────── POTENCIA ─────────────
  {
    id: 'cargada', nombre: 'Cargada', en: 'Clean', categoria: 'potencia',
    principales: ['gluteos', 'cuadriceps', 'trapecio'], secundarios: ['isquios', 'hombros', 'lumbar', 'antebrazos'],
    tecnica: {
      ejecucion: ['Peso pegado al cuerpo, espalda recta.', 'Extiende con fuerza cadera, rodillas y tobillos y encoge los hombros.', 'Mete los codos rápido por debajo y recibe el peso en los hombros con las rodillas algo flexionadas.'],
      errores: ['Tirar con los brazos antes de extender la cadera.', 'Alejar el peso del cuerpo.', 'Recibir con los codos bajos.'],
    },
    variantes: [
      v('hang_clean', 'Colgante con barra', 'Hang clean', ['barra'], 'carga', 'cargada', { nota: 'Empieza con la barra por encima de las rodillas.' }),
      v('deadlift_to_clean', 'Desde el suelo', 'Deadlift to clean', ['barra'], 'carga', 'cargada_suelo', { alias: ['Power clean'] }),
      v('kb_clean', 'Con kettlebells', 'Kettlebell clean', ['kettlebell'], 'carga', 'cargada_kb', {}),
      v('kb_clean_one', 'Con kettlebell a una mano', 'Kettlebell clean one hand', ['kettlebell'], 'carga', 'cargada_kb', {}),
      v('kb_clean_press', 'Cargada y press con kettlebells', 'Kettlebell clean and press', ['kettlebell'], 'carga', 'cargada_press_kb', { nota: 'Tras la cargada, empuja las kettlebells por encima de la cabeza.', principales: ['gluteos', 'hombros'], secundarios: ['cuadriceps', 'triceps', 'trapecio'] }),
      v('kb_one_arm_clean_press', 'Cargada y press a una mano', 'Kettlebell one arm clean and press', ['kettlebell'], 'carga', 'cargada_press_kb', { principales: ['gluteos', 'hombros'], secundarios: ['cuadriceps', 'triceps', 'abdomen'] }),
    ],
  },
  {
    id: 'arrancada', nombre: 'Arrancada', en: 'Snatch', categoria: 'potencia',
    principales: ['gluteos', 'hombros', 'trapecio'], secundarios: ['cuadriceps', 'isquios', 'lumbar'],
    tecnica: {
      ejecucion: ['Agarre ancho (con barra) y peso pegado al cuerpo.', 'Extiende con fuerza cadera, rodillas y tobillos.', 'Lleva el peso en un solo movimiento hasta arriba con el brazo o los brazos estirados.'],
      errores: ['Tirar con los brazos demasiado pronto.', 'Terminar con el peso por delante de la cabeza.'],
    },
    variantes: [
      v('hang_snatch', 'Colgante con barra', 'Hang snatch', ['barra'], 'carga', 'arrancada', {}),
      v('db_snatch', 'Con mancuerna a una mano', 'Dumbbell snatch', ['mancuerna'], 'carga', 'arrancada_mancuerna', {}),
    ],
  },
  {
    id: 'tiron_alto', nombre: 'Tirón alto', en: 'High pull', categoria: 'potencia',
    principales: ['trapecio', 'hombros'], secundarios: ['gluteos', 'isquios', 'biceps'],
    tecnica: {
      ejecucion: ['Barra a la altura de las rodillas, espalda recta.', 'Extiende la cadera con fuerza y tira de la barra con los codos altos hasta el pecho.', 'Baja controlado.'],
      errores: ['Tirar solo con los brazos.', 'Codos por debajo de las manos.'],
    },
    variantes: [v('high_pull', 'Con barra', 'High pull', ['barra'], 'carga', 'tiron_alto', {})],
  },

  // ───────────── CORE ─────────────
  {
    id: 'plancha', nombre: 'Plancha', en: 'Plank', categoria: 'core',
    principales: ['abdomen'], secundarios: ['hombros', 'gluteos'],
    tecnica: {
      ejecucion: ['Antebrazos en el suelo con los codos bajo los hombros.', 'Cuerpo en línea de la cabeza a los talones.', 'Aprieta abdomen y glúteos y respira con normalidad mientras aguantas.'],
      errores: ['Hundir la cadera.', 'Subir la cadera en pico.', 'Aguantar la respiración.'],
    },
    variantes: [
      v('cat:plank', 'Frontal', 'Plank', ['peso_corporal'], 'tiempo', 'plancha', { alias: ['Front bridge', 'Hover'] }),
      v('plank_knees', 'De rodillas', 'Plank on knees', ['peso_corporal'], 'tiempo', 'plancha_rodillas', {}),
      v('plank_one_arm', 'A un brazo', '1 arm on plank', ['peso_corporal'], 'tiempo', 'plancha', { nota: 'Levanta un brazo al frente sin girar la cadera.' }),
      v('plank_one_leg', 'A una pierna', '1 leg on plank', ['peso_corporal'], 'tiempo', 'plancha_pierna', { nota: 'Levanta una pierna estirada sin girar la cadera.', secundarios: ['gluteos', 'hombros'] }),
      v('hover_to_plank', 'De antebrazos a manos', 'Hover to plank', ['peso_corporal'], 'peso_corporal', 'plancha_a_manos', { nota: 'Pasa de apoyar los antebrazos a apoyar las manos, una y otra, sin mover la cadera.', secundarios: ['triceps', 'hombros'] }),
      v('plank_row', 'Con remo (mancuerna)', 'Plank row', ['mancuerna'], 'carga', 'plancha_remo', { alias: ['Dumbbell hover to row', 'Renegade row'], nota: 'En plancha sobre las mancuernas, tira de una hacia la cadera sin girar el tronco.', secundarios: ['espalda_media', 'dorsales', 'hombros'] }),
    ],
  },
  {
    id: 'plancha_lateral', nombre: 'Plancha lateral', en: 'Side bridge', categoria: 'core',
    principales: ['abdomen'], secundarios: ['hombros', 'abductores'],
    tecnica: {
      ejecucion: ['De lado, con el antebrazo bajo el hombro.', 'Sube la cadera hasta alinear el cuerpo.', 'Aguanta sin dejar que la cadera caiga.'],
      errores: ['Cadera hacia atrás.', 'Hombro hundido.'],
    },
    variantes: [
      v('side_bridge', 'Clásica', 'Side bridge', ['peso_corporal'], 'tiempo', 'plancha_lateral', { alias: ['Side plank'] }),
      v('side_bridge_one', 'A una pierna', 'Side bridge 1 leg', ['peso_corporal'], 'tiempo', 'plancha_lateral', { nota: 'Levanta la pierna de arriba.' }),
      v('side_bridge_knees', 'De rodillas', 'Side bridge on knees', ['peso_corporal'], 'tiempo', 'plancha_lateral_rodillas', {}),
    ],
  },
  {
    id: 'crunch', nombre: 'Crunch abdominal', en: 'Abdominal crunch', categoria: 'core',
    principales: ['abdomen'], secundarios: [],
    tecnica: {
      ejecucion: ['Rodillas dobladas y zona lumbar apoyada.', 'Acerca las costillas a la pelvis enrollando la espalda.', 'Vuelve despacio.'],
      errores: ['Tirar de la cabeza con las manos.', 'Subir con impulso.'],
    },
    variantes: [
      v('cat:crunches', 'En el suelo', 'Crunch', ['peso_corporal'], 'peso_corporal', 'crunch', { alias: ['Crunches', 'Abdominal crunch'] }),
      v('ab_crunch_machine', 'En máquina', 'Abdominal crunch machine', ['maquina'], 'carga', 'crunch_maquina', { ajustes: ['Ajusta el asiento para que las almohadillas queden sobre el pecho o los agarres junto a la cabeza.'] }),
      v('cable_crunch', 'En polea de rodillas', 'Cable crunch', ['polea'], 'carga', 'crunch_polea', { nota: 'De rodillas frente a la polea alta, cuerda junto a la cabeza; enrolla el tronco hacia abajo.' }),
      v('situp', 'Sit-up', 'Situp', ['peso_corporal'], 'peso_corporal', 'situp', { alias: ['Sit-up'], nota: 'Sube hasta sentarte del todo.', secundarios: ['cuadriceps'] }),
      v('elbow_to_knee', 'Codo a rodilla', 'Elbow to knee', ['peso_corporal'], 'peso_corporal', 'codo_rodilla', { nota: 'Lleva un codo hacia la rodilla contraria, alternando.' }),
      v('abdominal_row', 'Recogimiento sentado', 'Abdominal row', ['peso_corporal'], 'peso_corporal', 'recogimiento', { nota: 'Sentado y apoyado en las manos, recoge las rodillas al pecho y vuelve a estirarlas.' }),
    ],
  },
  {
    id: 'elevacion_piernas', nombre: 'Elevación de piernas', en: 'Leg raise', categoria: 'core',
    principales: ['abdomen'], secundarios: [],
    tecnica: {
      ejecucion: ['Espalda apoyada o cuerpo colgado sin balanceo.', 'Sube las piernas o las rodillas enrollando la pelvis.', 'Baja despacio.'],
      errores: ['Balancearse para subir.', 'Subir las piernas sin enrollar la pelvis.'],
    },
    variantes: [
      v('cat:hanging_leg_raise', 'Colgado', 'Hanging leg raise', ['barra_fija'], 'peso_corporal', 'elevacion_colgado', {}),
      v('ab_knee_raise', 'De rodillas en paralelas', 'Abdominal knee raise', ['paralelas'], 'peso_corporal', 'elevacion_rodillas', { alias: ["Captain's chair"], nota: 'Apoyado en los antebrazos, sube las rodillas al pecho.' }),
      v('dap_knee_raise_oblique', 'Rodillas a un lado con polea doble', 'Dap knee raise oblique', ['polea_doble'], 'carga', 'elevacion_polea', { nota: 'Tumbado con tobilleras en las poleas bajas; sube las rodillas en diagonal.' }),
      v('dap_leg_raise', 'Tumbado con polea doble', 'Dap leg raise', ['polea_doble'], 'carga', 'elevacion_polea', {}),
    ],
  },
  {
    id: 'rueda', nombre: 'Rueda abdominal', en: 'Ab wheel', categoria: 'core',
    principales: ['abdomen'], secundarios: ['dorsales', 'hombros'],
    tecnica: {
      ejecucion: ['De rodillas con la rueda bajo los hombros.', 'Rueda hacia delante con el abdomen tenso hasta donde mantengas la espalda neutra.', 'Vuelve tirando con el abdomen.'],
      errores: ['Hundir la zona lumbar.', 'Ir más lejos de lo que controlas.'],
    },
    variantes: [v('ab_wheel', 'De rodillas', 'ABD wheel', ['rueda'], 'peso_corporal', 'rueda', { alias: ['Ab roller'] })],
  },
  sola('tijeras', 'Tijeras', 'Scissor kicks', 'core', ['abdomen'], ['cuadriceps'], ['peso_corporal'], 'tiempo', 'tijeras', {
    ejecucion: ['Tumbado boca arriba con la zona lumbar pegada al suelo.', 'Piernas estiradas cerca del suelo; alterna subir y bajar cada una.', 'Mantén el ritmo sin que la espalda se arquee.'],
    errores: ['Arquear la zona lumbar.', 'Tensar el cuello.'],
  }),
  sola('hundred', 'Hundred (pilates)', 'Hundred', 'core', ['abdomen'], ['cuadriceps'], ['peso_corporal'], 'tiempo', 'hundred', {
    ejecucion: ['Tumbado boca arriba, cabeza y hombros despegados y piernas en mesa o estiradas.', 'Bombea los brazos estirados junto al cuerpo: 5 tiempos inspirando y 5 espirando.', 'Hasta 100 bombeos.'],
    errores: ['Arquear la zona lumbar.', 'Tirar del cuello.'],
  }),
  {
    id: 'rotacion', nombre: 'Rotación de tronco', en: 'Trunk rotation', categoria: 'core',
    principales: ['abdomen'], secundarios: ['hombros'],
    tecnica: {
      ejecucion: ['Brazos casi estirados, abdomen tenso.', 'Gira el tronco desde la cadera llevando el agarre en diagonal.', 'Vuelve despacio controlando el giro.'],
      errores: ['Tirar con los brazos.', 'Girar solo los hombros sin mover la cadera.'],
    },
    variantes: [
      v('woodchop_down', 'Leñador descendente en polea', 'Woodchop down', ['polea'], 'carga', 'lenador_bajo', { alias: ['Cable woodchop'] }),
      v('woodchop_up', 'Leñador ascendente en polea', 'Woodchop up', ['polea'], 'carga', 'lenador_alto', {}),
      v('woodchop_knees', 'Leñador de rodillas', 'Woodchop on knees', ['polea'], 'carga', 'lenador_rodillas', {}),
      v('cable_ab_rotation', 'Rotación en polea', 'Cable abdominal rotation', ['polea'], 'carga', 'rotacion_polea', { alias: ['Pallof rotation'] }),
      v('seated_plate_rotation', 'Sentado con disco', 'Seated plate rotation', ['disco'], 'carga', 'rotacion_disco', { alias: ['Russian twist'], nota: 'Sentado con los pies en el aire o apoyados, lleva el disco de un lado a otro.' }),
    ],
  },
  {
    id: 'flexion_lateral', nombre: 'Flexión lateral', en: 'Side bend', categoria: 'core',
    principales: ['abdomen'], secundarios: ['lumbar'],
    tecnica: {
      ejecucion: ['De pie con una mancuerna en una mano.', 'Inclina el tronco hacia el lado de la mancuerna sin girarlo.', 'Vuelve con los oblicuos del otro lado.'],
      errores: ['Girar el tronco o echarlo adelante.', 'Usar mucho peso.'],
    },
    variantes: [v('db_lateral_flexion', 'Con mancuerna', 'Dumbbell lateral flexion', ['mancuerna'], 'carga', 'flexion_lateral', {})],
  },

  // ───────────── SALTOS Y HIIT ─────────────
  {
    id: 'salto_cajon', nombre: 'Salto al cajón', en: 'Box jump', categoria: 'pliometria',
    principales: ['cuadriceps', 'gluteos'], secundarios: ['gemelos', 'isquios'],
    tecnica: {
      ejecucion: ['De pie a un paso del cajón.', 'Brazos atrás, flexiona y salta extendiendo todo el cuerpo.', 'Aterriza suave con los pies enteros sobre el cajón y baja andando.'],
      errores: ['Aterrizar con las rodillas hacia dentro.', 'Bajar saltando hacia atrás.', 'Cajón demasiado alto.'],
    },
    variantes: [
      v('box_jump', 'Simple', 'Box jump', ['cajon'], 'peso_corporal', 'salto_cajon', {}),
      v('box_jump_burpee', 'Con burpee', 'Box jump + burpee', ['cajon'], 'peso_corporal', 'salto_cajon', { nota: 'Al bajar del cajón, haz un burpee.', secundarios: ['pecho', 'gemelos'] }),
      v('box_jump_pushup', 'Con flexión', 'Box jump + push up', ['cajon'], 'peso_corporal', 'salto_cajon', { nota: 'Al bajar del cajón, haz una flexión.', secundarios: ['pecho', 'triceps'] }),
      v('box_over_the_top', 'Por encima del cajón', 'Box over the top', ['cajon'], 'peso_corporal', 'salto_lateral_cajon', { nota: 'Salta de un lado al otro del cajón (subiendo o pasando por encima).' }),
    ],
  },
  {
    id: 'burpee', nombre: 'Burpee', en: 'Burpee', categoria: 'pliometria',
    principales: ['cuadriceps', 'pecho'], secundarios: ['hombros', 'triceps', 'abdomen'],
    tecnica: {
      ejecucion: ['Agáchate y apoya las manos.', 'Lleva los pies atrás a plancha (con flexión si quieres).', 'Recoge los pies y salta con los brazos arriba.'],
      errores: ['Hundir la cadera en la plancha.', 'Aterrizar rígido.'],
    },
    variantes: [
      v('burpee', 'Clásico', 'Burpee', ['peso_corporal'], 'peso_corporal', 'burpee', {}),
      v('cable_sprint_burpee', 'Con sprint en polea', 'Cable sprint + burpee', ['polea'], 'peso_corporal', 'sprint_polea', { nota: 'Con un cinturón unido a la polea, sprint corto contra la resistencia y burpee al volver.', principales: ['cuadriceps', 'gluteos'] }),
    ],
  },
  sola('jumping_jacks', 'Jumping jacks', 'Jumping jacks', 'pliometria', ['cuadriceps', 'gemelos'], ['hombros', 'abductores'], ['peso_corporal'], 'tiempo', 'jumping_jacks', {
    ejecucion: ['Salta separando los pies y subiendo los brazos por encima de la cabeza.', 'Vuelve a juntar pies y brazos de un salto.', 'Ritmo constante, aterrizando sobre la parte delantera del pie.'],
    errores: ['Aterrizar sobre los talones.', 'Brazos a medio camino.'],
  }, { alias: ['Saltos de tijera'] }),
  sola('talones_gluteo', 'Talones al glúteo', 'Butt kicks', 'pliometria', ['isquios'], ['gemelos', 'cuadriceps'], ['peso_corporal'], 'tiempo', 'talones_gluteo', {
    ejecucion: ['Trota en el sitio llevando los talones hacia los glúteos.', 'Tronco erguido y brazos acompañando.', 'Pasos cortos y rápidos.'],
    errores: ['Inclinar el tronco adelante.', 'Apoyar los talones.'],
  }),
  sola('escalador', 'Escalador', 'Mountain climber', 'pliometria', ['abdomen', 'cuadriceps'], ['hombros'], ['peso_corporal'], 'tiempo', 'escalador', {
    ejecucion: ['En plancha con las manos bajo los hombros.', 'Lleva una rodilla hacia el pecho y cambia de pierna rápido.', 'Mantén la cadera baja y quieta.'],
    errores: ['Subir la cadera.', 'Hombros por detrás de las manos.'],
  }),
  {
    id: 'sprint_polea', nombre: 'Carrera contra polea', en: 'Cable sprint', categoria: 'pliometria',
    principales: ['cuadriceps', 'gluteos'], secundarios: ['gemelos', 'isquios'],
    tecnica: {
      ajustes: ['Cinturón o arnés unido a la polea baja.'],
      ejecucion: ['Inclínate hacia delante contra la resistencia.', 'Pasos cortos y rápidos, empujando con la parte delantera del pie.', 'Vuelve caminando controlando el cable.'],
      errores: ['Echarse atrás al volver.', 'Dejar que el cable tire de golpe.'],
    },
    variantes: [
      v('cable_skipping', 'Skipping', 'Cable skipping', ['polea'], 'tiempo', 'skipping_polea', { nota: 'Rodillas altas en el sitio contra la resistencia.' }),
      v('cable_lateral_sprint', 'Sprint lateral', 'Cable lateral sprint', ['polea'], 'tiempo', 'sprint_lateral', { nota: 'Con el cable de lado, desplazamientos laterales rápidos.', principales: ['cuadriceps', 'abductores'] }),
    ],
  },
  sola('saltos_kb', 'Saltos con kettlebell', 'Kettlebell bunny hops', 'pliometria', ['cuadriceps', 'gemelos'], ['gluteos'], ['kettlebell'], 'peso_corporal', 'saltos_kb', {
    ejecucion: ['Kettlebell sujeta al pecho, en media sentadilla.', 'Saltos cortos y seguidos hacia delante o en el sitio.', 'Aterriza suave sin perder la postura.'],
    errores: ['Ponerse de pie entre saltos.', 'Aterrizar rígido.'],
  }),

  // ───────────── CARDIO ─────────────
  {
    id: 'cinta', nombre: 'Cinta de correr', en: 'Treadmill', categoria: 'cardio',
    principales: ['cuadriceps'], secundarios: ['gemelos', 'gluteos', 'isquios'],
    tecnica: {
      ejecucion: ['Calienta 5 minutos andando o trotando suave.', 'Corre erguido, mirando al frente y con pasos cortos.', 'Apoya el pie bajo la cadera, no muy por delante.'],
      errores: ['Agarrarse a la barandilla.', 'Pasos demasiado largos.', 'Correr pegado al frontal de la cinta.'],
    },
    variantes: [v('cat:running_treadmill', 'Correr', 'Treadmill', ['cardio'], 'cardio', 'cinta', { alias: ['Running'] })],
  },
  {
    id: 'bicicleta', nombre: 'Bicicleta estática', en: 'Bike', categoria: 'cardio',
    principales: ['cuadriceps'], secundarios: ['gemelos', 'gluteos', 'isquios'],
    tecnica: {
      ajustes: ['Altura del sillín: con el pedal abajo, la rodilla queda ligeramente flexionada.'],
      ejecucion: ['Pedalea con cadencia constante.', 'Ajusta la resistencia para el ritmo que quieras.', 'Mantén los hombros relajados.'],
      errores: ['Sillín demasiado bajo: carga las rodillas.', 'Balancear la cadera sobre el sillín.'],
    },
    variantes: [
      v('cat:bicycling_stationary', 'Vertical', 'Bike', ['cardio'], 'cardio', 'bici', { alias: ['Stationary bike'] }),
      v('recumbent_bike', 'Reclinada', 'Recumbent bike', ['cardio'], 'cardio', 'bici_reclinada', { nota: 'Con respaldo; cuida más la espalda.' }),
    ],
  },
  {
    id: 'eliptica', nombre: 'Elíptica', en: 'Elliptical', categoria: 'cardio',
    principales: ['cuadriceps'], secundarios: ['gluteos', 'isquios', 'gemelos', 'hombros'],
    tecnica: {
      ejecucion: ['Pies enteros apoyados en los pedales.', 'Tronco erguido y mirada al frente.', 'Usa los brazos para acompañar el movimiento y ajusta la resistencia.'],
      errores: ['Apoyar todo el peso en los brazos.', 'Ir de puntillas.'],
    },
    variantes: [v('cat:elliptical_trainer', 'Elíptica', 'Elliptic', ['cardio'], 'cardio', 'eliptica', { alias: ['Elliptical trainer'] })],
  },
  {
    id: 'remoergometro', nombre: 'Remo ergómetro', en: 'Rower', categoria: 'cardio',
    principales: ['cuadriceps', 'espalda_media'], secundarios: ['biceps', 'gluteos', 'isquios', 'lumbar'],
    tecnica: {
      ajustes: ['Ajusta las cintas sobre la parte ancha del pie.'],
      ejecucion: ['Empieza con las piernas: empuja con ellas con los brazos estirados.', 'Cuando las piernas están casi estiradas, inclina un poco el tronco hacia atrás y tira del mango hacia el pecho bajo.', 'Vuelve en orden inverso: brazos, tronco y por último piernas.'],
      errores: ['Tirar con los brazos antes de empujar con las piernas.', 'Redondear la espalda.', 'Doblar las rodillas antes de que el mango pase sobre ellas en la vuelta.'],
    },
    variantes: [v('cat:rowing_stationary', 'Remo', 'Rower', ['cardio'], 'cardio', 'remoergometro', { alias: ['Rowing machine'] })],
  },
  {
    id: 'escaladora', nombre: 'Escaladora', en: 'Stair climber', categoria: 'cardio',
    principales: ['cuadriceps', 'gluteos'], secundarios: ['gemelos', 'isquios'],
    tecnica: {
      ejecucion: ['Apoya el pie entero en cada escalón.', 'Tronco erguido; las manos solo para equilibrio.', 'Ritmo que puedas mantener.'],
      errores: ['Colgarse de las barandillas.', 'Inclinarse mucho hacia delante.'],
    },
    variantes: [v('cat:stairmaster', 'Escaladora', 'Stairmaster', ['cardio'], 'cardio', 'escaladora', {})],
  },

  // ───────────── MOVILIDAD ─────────────
  sola('gusano', 'Gusano (inchworm)', 'Inch worm', 'movilidad', ['isquios', 'abdomen'], ['hombros'], ['peso_corporal'], 'peso_corporal', 'gusano', {
    ejecucion: ['De pie, baja las manos al suelo con las piernas lo más estiradas posible.', 'Avanza con las manos hasta la plancha.', 'Vuelve caminando con los pies hacia las manos y sube.'],
    errores: ['Doblar mucho las rodillas.', 'Hundir la cadera en la plancha.'],
  }),
  sola('estiramiento_dorsal', 'Estiramiento de hombro y dorsal', 'Shoulder lat stretch', 'movilidad', ['dorsales', 'hombros'], [], ['peso_corporal'], 'tiempo', 'estiramiento_dorsal', {
    ejecucion: ['Manos en un apoyo a la altura de la cadera, pies atrás.', 'Lleva el pecho hacia el suelo con los brazos estirados.', 'Respira y mantén 20–30 s.'],
    errores: ['Rebotar.', 'Arquear la zona lumbar.'],
  }),

];
