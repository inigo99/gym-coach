/**
 * Posición de inicio y final de cada ilustración (clave `pose` del catálogo).
 * La figura mira a la derecha. Ángulos absolutos: 0 arriba, 90 delante, 180 abajo, 270 atrás.
 */
import type { Material, Pose, Punto } from './figura';

type Par = [Pose, Pose];

// Posturas base
const pie = (o: Partial<Pose> = {}): Pose => ({ tronco: 0, brazo: [180, 180], pierna: [180, 180], ...o });
const sentado = (o: Partial<Pose> = {}): Pose => ({ tronco: -4, brazo: [180, 180], pierna: [90, 180], ...o });
const supino = (o: Partial<Pose> = {}): Pose => ({ tronco: -90, cabeza: -88, brazo: [90, 90], pierna: [52, 172], ...o });
const prono = (o: Partial<Pose> = {}): Pose => ({ tronco: 78, cabeza: 82, brazo: [180, 180], pierna: [257, 257], pie: 180, ...o });
const sentadilla = (o: Partial<Pose> = {}): Pose => ({ tronco: 38, brazo: [150, 90], pierna: [95, 205], ...o });
const zancadaBaja = (o: Partial<Pose> = {}): Pose => ({ tronco: 4, brazo: [180, 180], pierna: [95, 180], pierna2: [200, 270], pie2: 180, ...o });
const deRodillas = (o: Partial<Pose> = {}): Pose => ({ tronco: 0, brazo: [180, 180], pierna: [180, 270], pie: 270, ...o });

// Material
const ESPALDA: [number, number] = [205, 350]; // barra sobre los hombros: codo abajo y atrás
const BARRA: Material = { t: 'barra' };
const MAN: Material = { t: 'mancuerna' };
const MAN2: Material = { t: 'mancuerna', en: 'mano2' };
const KB: Material = { t: 'kettlebell' };
const AGARRE: Material = { t: 'agarre' };
const SMITH: Material = { t: 'smith' };
const ESTERILLA: Material = { t: 'esterilla' };
const polea = (ancla: Punto, en: 'mano' | 'mano2' | 'tobillo' | 'cadera' = 'mano'): Material => ({ t: 'polea', ancla, en });
const bancoTumbado: Material = { t: 'banco', desde: 'cadera', hasta: 'cabeza' };
const asiento = (respaldo = true): Material => ({ t: 'asiento', respaldo });
const con = (p: Pose, ...m: Material[]): Pose => ({ ...p, material: [...(p.material ?? []), ...m] });
const ambos = (par: Par, ...m: Material[]): Par => [con(par[0], ...m), con(par[1], ...m)];

// Movimientos que se repiten con distinto material
// En banco: muslos casi horizontales y pies al suelo, para que el tronco quede a la altura del banco.
const enBanco = (o: Partial<Pose> = {}): Pose => supino({ pierna: [105, 180], ...o });
const pressBanca: Par = [enBanco({ brazo: [0, 0] }), enBanco({ brazo: [125, 5] })];
const pressInclinado: Par = [
  { tronco: -55, cabeza: -50, brazo: [20, 20], pierna: [70, 175] },
  { tronco: -55, cabeza: -50, brazo: [160, 30], pierna: [70, 175] },
];
const pressHombros: Par = [sentado({ brazo: [160, 15] }), sentado({ brazo: [5, 0] })];
const pressHombrosPie: Par = [pie({ brazo: [160, 15] }), pie({ brazo: [5, 0] })];
const sentadillaPar = (brazo: [number, number]): Par => [pie({ brazo }), sentadilla({ brazo })];
const curl: Par = [pie({ brazo: [172, 172] }), pie({ brazo: [170, 25] })];
const remoInclinado: Par = [pie({ tronco: 60, brazo: [180, 180], pierna: [170, 190] }), pie({ tronco: 60, brazo: [250, 160], pierna: [170, 190] })];
const pesoMuerto: Par = [pie({ tronco: 62, brazo: [180, 180], pierna: [120, 195] }), pie({ tronco: 2, brazo: [180, 180] })];
const zancadaPar = (o: Partial<Pose> = {}): Par => [pie({ pierna2: [190, 180], ...o }), zancadaBaja(o)];
const flexion: Par = [prono(), prono({ tronco: 84, brazo: [300, 165] })];
const plancha: Par = [prono({ tronco: 82, brazo: [180, 90] }), prono({ tronco: 82, brazo: [180, 90] })];
const saltoArriba = (o: Partial<Pose> = {}): Pose => pie({ brazo: [10, 5], pie: 140, elevado: 14, ...o });

export const POSES: Record<string, Par> = {
  // ── Empuje
  press_banca: ambos(pressBanca, bancoTumbado, BARRA),
  press_banca_mancuernas: ambos(pressBanca, bancoTumbado, MAN),
  press_banca_smith: ambos(pressBanca, bancoTumbado, SMITH),
  press_inclinado: ambos(pressInclinado, { t: 'banco', desde: 'cadera', hasta: 'hombro', inclinado: true }, MAN),
  press_inclinado_smith: ambos(pressInclinado, { t: 'banco', desde: 'cadera', hasta: 'hombro', inclinado: true }, SMITH),
  press_pecho_maquina: ambos([sentado({ brazo: [150, 80] }), sentado({ brazo: [95, 92] })], asiento(), AGARRE),
  press_polea_una: ambos([zancadaBaja({ tronco: 10, brazo: [150, 75], pierna: [160, 180], pierna2: [200, 190], pie2: 90 }), zancadaBaja({ tronco: 14, brazo: [90, 90], pierna: [160, 180], pierna2: [200, 190], pie2: 90 })], polea([-28, -30])),
  press_polea_barra: ambos([pie({ tronco: 8, brazo: [150, 75], pierna2: [200, 185] }), pie({ tronco: 10, brazo: [92, 92], pierna2: [200, 185] })], polea([-30, -30]), polea([-30, -30], 'mano2')),
  aperturas_maquina: ambos([sentado({ brazo: [100, 60], brazo2: [100, 60] }), sentado({ brazo: [80, 90] })], asiento(), AGARRE),
  aperturas_mancuernas: ambos([enBanco({ brazo: [130, 40] }), enBanco({ brazo: [0, 0] })], bancoTumbado, MAN),
  cruce_polea: ambos([pie({ tronco: 12, brazo: [40, 55], pierna2: [200, 185] }), pie({ tronco: 15, brazo: [140, 150], pierna2: [200, 185] })], polea([-20, -62])),
  flexion: flexion,
  flexion_rodillas: [prono({ tronco: 70, pierna: [240, 280], pie: 0 }), prono({ tronco: 80, pierna: [245, 285], pie: 0, brazo: [300, 165] })],
  flexion_pica: [pie({ tronco: 135, cabeza: 150, brazo: [140, 140], pierna: [215, 215], pie: 90 }), pie({ tronco: 150, cabeza: 165, brazo: [100, 160], pierna: [215, 215], pie: 90 })],
  flexion_mantener: [flexion[1], flexion[1]],
  flexion_rotacion: [prono(), prono({ tronco: 70, brazo: [180, 180], brazo2: [0, 0] })],
  flexion_cajon: [con(prono({ tronco: 50, pierna: [238, 238] }), { t: 'cajon', bajo: 'mano', ancho: 16 }), con(prono({ tronco: 50, pierna: [238, 238], brazo2: [140, 30] }), { t: 'cajon', bajo: 'mano', ancho: 16 })],
  fondos_paralelas: ambos([pie({ tronco: 5, brazo: [178, 178], pierna: [165, 235], elevado: 16 }), pie({ tronco: 14, brazo: [235, 175], pierna: [165, 235], elevado: 4 })], { t: 'paralelas' }),
  fondos_banco: [
    { tronco: 0, brazo: [190, 180], pierna: [100, 165], pie: 60, material: [{ t: 'cajon', x: -9, alto: 27, ancho: 14 }] },
    { tronco: 2, brazo: [245, 175], pierna: [75, 160], pie: 60, material: [{ t: 'cajon', x: -17, alto: 15, ancho: 14 }] },
  ],
  fondos_maquina: ambos([sentado({ brazo: [175, 20] }), sentado({ brazo: [190, 180] })], asiento(), AGARRE),
  press_militar: ambos(pressHombrosPie, BARRA),
  press_hombros_mancuernas: ambos(pressHombros, asiento(), MAN),
  press_hombros_maquina: ambos(pressHombros, asiento(), AGARRE),
  press_hombros_horizontal: ambos([sentado({ brazo: [150, 40] }), sentado({ brazo: [50, 45] })], asiento(), AGARRE),
  press_hombros_smith: ambos(pressHombros, asiento(), SMITH),
  push_press: ambos([pie({ brazo: [160, 15], pierna: [150, 200] }), pie({ brazo: [5, 0] })], BARRA),
  push_press_kb: ambos([pie({ brazo: [160, 15], pierna: [150, 200] }), pie({ brazo: [5, 0] })], KB),
  elevacion_lateral: ambos([pie({ brazo: [175, 175] }), pie({ brazo: [100, 95] })], MAN),
  elevacion_frontal: ambos([pie({ brazo: [175, 175] }), pie({ brazo: [80, 80] })], MAN),
  elevacion_y_polea: ambos([pie({ tronco: -5, brazo: [160, 160] }), pie({ tronco: -5, brazo: [30, 30] })], polea([30, 30])),
  pajaros_maquina: ambos([sentado({ tronco: 10, brazo: [90, 90] }), sentado({ tronco: 10, brazo: [250, 250] })], { t: 'asiento' }, AGARRE),
  pajaros_mancuernas: ambos([pie({ tronco: 70, brazo: [180, 175], pierna: [165, 190] }), pie({ tronco: 70, brazo: [265, 265], pierna: [165, 190] })], MAN),
  pajaros_polea: ambos([pie({ tronco: 5, brazo: [90, 90] }), pie({ tronco: 5, brazo: [255, 255] })], polea([40, -45])),
  triceps_polea: ambos([pie({ tronco: 12, brazo: [175, 40] }), pie({ tronco: 12, brazo: [180, 180] })], polea([16, -70])),
  press_frances: ambos([enBanco({ brazo: [10, 10] }), enBanco({ brazo: [10, 300] })], bancoTumbado, BARRA),
  triceps_nuca: ambos([pie({ brazo: [5, 200] }), pie({ brazo: [5, 0] })], MAN),
  patada_triceps: ambos([pie({ tronco: 70, brazo: [260, 180], pierna: [165, 190] }), pie({ tronco: 70, brazo: [260, 260], pierna: [165, 190] })], MAN),

  // ── Tirón
  dominada: ambos([pie({ brazo: [3, 0], pierna: [178, 212], elevado: 3 }), pie({ tronco: 8, brazo: [160, 15], pierna: [178, 212], elevado: 27 })], { t: 'barra_fija' }),
  dominada_polea: ambos([pie({ brazo: [10, 5] }), pie({ tronco: 6, brazo: [165, 15], pierna: [165, 195] })], polea([12, -78]), polea([12, -78], 'mano2')),
  jalon: ambos([sentado({ tronco: -10, brazo: [15, 10] }), sentado({ tronco: -15, brazo: [170, 10] })], { t: 'asiento' }, polea([8, -82]), { t: 'almohadilla', en: 'rodilla' }),
  remo_barra: ambos(remoInclinado, BARRA),
  // Rodilla y mano lejanas sobre el banco; la pierna cercana, de pie en el suelo.
  remo_mancuerna: ambos([pie({ tronco: 75, brazo: [180, 180], brazo2: [180, 180], pierna2: [180, 270], pie2: 270 }), pie({ tronco: 75, brazo: [260, 165], brazo2: [180, 180], pierna2: [180, 270], pie2: 270 })], { t: 'cajon', x: 5, alto: 22, ancho: 62 }, MAN),
  remo_polea: ambos([sentado({ tronco: 10, brazo: [95, 92], pierna: [75, 100] }), sentado({ tronco: -8, brazo: [215, 95], pierna: [75, 100] })], polea([62, 10])),
  remo_maquina: ambos([sentado({ tronco: 15, brazo: [95, 92] }), sentado({ tronco: 10, brazo: [225, 95] })], { t: 'asiento' }, AGARRE),
  remo_smith: ambos(remoInclinado, SMITH),
  remo_polea_una: ambos([pie({ tronco: 12, brazo: [92, 92], pierna2: [200, 185] }), pie({ tronco: 8, brazo: [235, 95], pierna2: [200, 185] })], polea([60, -30])),
  pullover: ambos([enBanco({ brazo: [-75, -70] }), enBanco({ brazo: [10, 15] })], bancoTumbado, MAN),
  pullover_polea: ambos([pie({ tronco: 25, brazo: [40, 45], pierna: [170, 185] }), pie({ tronco: 25, brazo: [170, 170], pierna: [170, 185] })], polea([30, -65])),
  curl_barra: ambos(curl, BARRA),
  curl_mancuerna: ambos(curl, MAN),
  curl_maquina: ambos([sentado({ tronco: 10, brazo: [120, 100] }), sentado({ tronco: 10, brazo: [120, 15] })], { t: 'asiento' }, { t: 'almohadilla', en: 'codo' }, AGARRE),
  curl_polea: ambos(curl, polea([28, 24])),

  // ── Piernas
  sentadilla: sentadillaPar([150, 90]),
  sentadilla_barra: ambos(sentadillaPar(ESPALDA), { t: 'barra', en: 'hombro' }),
  sentadilla_frontal: ambos([pie({ brazo: [130, 300] }), sentadilla({ tronco: 22, brazo: [110, 300] })], { t: 'barra', en: 'hombro' }),
  sentadilla_smith: ambos(sentadillaPar(ESPALDA), { t: 'smith', en: 'hombro' }),
  sentadilla_goblet: ambos([pie({ brazo: [170, 30] }), sentadilla({ tronco: 25, brazo: [140, 30] })], KB),
  sentadilla_polea: ambos([pie({ brazo: [170, 175] }), sentadilla({ brazo: [175, 180] })], polea([40, 20])),
  sentadilla_asistida: ambos([pie({ brazo: [100, 95] }), sentadilla({ tronco: 15, brazo: [95, 92] })], polea([46, -24])),
  sentadilla_una: [pie({ brazo: [90, 90], pierna2: [140, 160] }), sentadilla({ brazo: [90, 90], pierna2: [90, 90], pie2: 70 })],
  sentadilla_salto: [sentadilla({ brazo: [200, 200] }), saltoArriba()],
  sentadilla_salto_barra: ambos([sentadilla({ brazo: ESPALDA }), saltoArriba({ brazo: ESPALDA })], { t: 'barra', en: 'hombro' }),
  sentadilla_salto_polea: ambos([sentadilla({ brazo: [175, 180] }), saltoArriba({ brazo: [180, 180] })], polea([40, 20])),
  thruster: ambos([sentadilla({ tronco: 22, brazo: [130, 0] }), pie({ brazo: [5, 0] })], BARRA),
  thruster_kb: ambos([sentadilla({ tronco: 22, brazo: [130, 0] }), pie({ brazo: [5, 0] })], KB),
  prensa: [
    { tronco: -55, cabeza: -45, brazo: [150, 160], pierna: [40, 135], pie: 50, material: [{ t: 'banco', desde: 'cadera', hasta: 'hombro', inclinado: true }, { t: 'almohadilla', en: 'tobillo' }] },
    { tronco: -55, cabeza: -45, brazo: [150, 160], pierna: [65, 65], pie: 0, material: [{ t: 'banco', desde: 'cadera', hasta: 'hombro', inclinado: true }, { t: 'almohadilla', en: 'tobillo' }] },
  ],
  extension_cuadriceps: ambos([sentado({ brazo: [175, 175], pierna: [90, 185], elevado: 4 }), sentado({ brazo: [175, 175], pierna: [90, 95], elevado: 21 })], asiento(), { t: 'almohadilla', en: 'tobillo' }),
  extension_cuadriceps_pie: ambos([pie({ pierna: [140, 200], pierna2: [180, 180] }), pie({ pierna: [140, 140], pierna2: [180, 180] })], polea([-30, 30], 'tobillo')),
  curl_femoral_tumbado: ambos([prono({ tronco: 92, cabeza: 92, brazo: [150, 150], pierna: [270, 270], pie: 180, elevado: 22 }), prono({ tronco: 92, cabeza: 92, brazo: [150, 150], pierna: [270, 30], pie: 330, elevado: 22 })], { t: 'banco', desde: 'cadera', hasta: 'hombro' }, { t: 'almohadilla', en: 'tobillo' }),
  curl_femoral_sentado: ambos([sentado({ pierna: [90, 92], elevado: 21 }), sentado({ pierna: [90, 200], elevado: 4 })], asiento(), { t: 'almohadilla', en: 'tobillo' }),
  curl_femoral_pie: ambos([pie({ tronco: 8, brazo: [140, 90], pierna: [185, 185], pierna2: [180, 180] }), pie({ tronco: 8, brazo: [140, 90], pierna: [185, 330], pierna2: [180, 180] })], { t: 'almohadilla', en: 'tobillo' }),
  nordico: [deRodillas({ brazo: [170, 150] }), deRodillas({ tronco: 60, brazo: [130, 120] })],
  zancada: zancadaPar(),
  zancada_mancuernas: ambos(zancadaPar(), MAN),
  zancada_smith: ambos(zancadaPar({ brazo: ESPALDA }), { t: 'smith', en: 'hombro' }),
  zancada_polea: ambos(zancadaPar({ brazo: [175, 175] }), polea([30, 25])),
  bulgara: [
    pie({ pierna2: [205, 280], pie2: 230, material: [{ t: 'cajon', x: -36, alto: 20, ancho: 14 }] }),
    zancadaBaja({ pierna: [100, 180], pierna2: [200, 290], pie2: 230, material: [{ t: 'cajon', x: -34, alto: 20, ancho: 14 }] }),
  ],
  zancada_rotacion: ambos([pie({ brazo: [50, 50], pierna2: [190, 180] }), zancadaBaja({ tronco: 10, brazo: [150, 150] })], polea([40, -50])),
  zancada_press: ambos([pie({ brazo: [150, 70], pierna2: [190, 180] }), zancadaBaja({ tronco: 12, brazo: [90, 90] })], polea([-34, -20])),
  zancada_remo: ambos([pie({ brazo: [90, 90], pierna2: [190, 180] }), zancadaBaja({ brazo: [230, 95] })], polea([60, -20])),
  step_up: [
    pie({ pierna: [100, 180], pierna2: [180, 180], material: [{ t: 'cajon', x: 30, alto: 22, ancho: 22 }, MAN] }),
    pie({ elevado: 22, pierna2: [190, 230], pie2: 150, material: [{ t: 'cajon', x: 2, alto: 22, ancho: 22 }, MAN] }),
  ],
  gemelos: [pie({ elevado: 3 }), pie({ pie: 150, elevado: 8 })],
  gemelos_mancuerna: ambos([pie({ elevado: 3 }), pie({ pie: 150, elevado: 8 })], MAN),
  gemelos_maquina: ambos([pie({ brazo: [160, 20], elevado: 3 }), pie({ brazo: [160, 20], pie: 150, elevado: 8 })], { t: 'almohadilla', en: 'hombro' }),
  gemelos_smith: ambos([pie({ brazo: ESPALDA, elevado: 3 }), pie({ brazo: ESPALDA, pie: 150, elevado: 8 })], { t: 'smith', en: 'hombro' }),
  gemelos_sentado: ambos([sentado({ brazo: [160, 160] }), sentado({ brazo: [160, 160], pie: 150 })], asiento(false), { t: 'smith', en: 'rodilla' }),
  copenhague: ambos([{ tronco: 80, cabeza: 80, brazo: [180, 90], pierna: [260, 262], pierna2: [265, 265], pie: 180, elevado: 0 }, { tronco: 90, cabeza: 90, brazo: [180, 90], pierna: [270, 270], pierna2: [270, 270], pie: 180 }], { t: 'cajon', x: -45, alto: 16, ancho: 14 }),
  abduccion: ambos([pie({ brazo: [120, 120], pierna: [182, 182], pierna2: [180, 180] }), pie({ brazo: [120, 120], pierna: [220, 220], pierna2: [180, 180] })], polea([30, 25], 'tobillo')),

  // ── Cadera
  peso_muerto: ambos(pesoMuerto, BARRA),
  peso_muerto_rumano: ambos([pie({ tronco: 2 }), pie({ tronco: 75, pierna: [165, 185] })], BARRA),
  peso_muerto_kb: ambos(pesoMuerto, KB),
  peso_muerto_remo: ambos([pesoMuerto[0], pie({ tronco: 50, brazo: [240, 160], pierna: [165, 190] })], BARRA),
  puente: ambos([supino({ pierna: [52, 172] }), supino({ tronco: -105, cabeza: -95, pierna: [70, 175] })], ESTERILLA),
  puente_una: ambos([supino({ pierna: [52, 172], pierna2: [55, 55] }), supino({ tronco: -105, cabeza: -95, pierna: [70, 175], pierna2: [75, 75] })], ESTERILLA),
  hip_thrust: ambos([{ tronco: -75, cabeza: -80, brazo: [90, 90], pierna: [40, 170] }, { tronco: -95, cabeza: -85, brazo: [90, 90], pierna: [80, 178] }], { t: 'cajon', x: -38, alto: 26, ancho: 14 }, { t: 'barra', en: 'cadera' }),
  patada_gluteo: ambos([pie({ tronco: 20, brazo: [140, 120], pierna: [182, 182], pierna2: [175, 180] }), pie({ tronco: 22, brazo: [140, 120], pierna: [230, 230], pierna2: [175, 180] })], polea([45, 30], 'tobillo')),
  patada_cuadrupedia: [prono({ tronco: 90, brazo: [180, 180], pierna: [180, 270], pierna2: [180, 270], pie: 270 }), prono({ tronco: 90, brazo: [180, 180], pierna: [265, 265], pierna2: [180, 270], pie: 180, pie2: 270 })],
  swing: ambos([pie({ tronco: 60, brazo: [200, 200], pierna: [150, 195] }), pie({ tronco: -4, brazo: [92, 92] })], KB),
  swing_mancuerna: ambos([pie({ tronco: 60, brazo: [200, 200], pierna: [150, 195] }), pie({ tronco: -4, brazo: [92, 92] })], MAN),
  superman: ambos([prono({ tronco: 90, cabeza: 90, brazo: [90, 90], pierna: [270, 270], pie: 270 }), prono({ tronco: 80, cabeza: 75, brazo: [70, 70], pierna: [278, 278], pie: 270 })], ESTERILLA),

  // ── Potencia
  cargada: ambos([pie({ tronco: 30, brazo: [180, 180], pierna: [165, 190] }), pie({ tronco: 5, brazo: [140, 300], pierna: [160, 195] })], BARRA),
  cargada_suelo: ambos([pesoMuerto[0], pie({ tronco: 5, brazo: [140, 300], pierna: [160, 195] })], BARRA),
  cargada_kb: ambos([pie({ tronco: 50, brazo: [200, 200], pierna: [155, 195] }), pie({ brazo: [150, 20] })], KB),
  cargada_press_kb: ambos([pie({ brazo: [150, 20] }), pie({ brazo: [5, 0] })], KB),
  arrancada: ambos([pie({ tronco: 30, brazo: [180, 180], pierna: [165, 190] }), pie({ tronco: -3, brazo: [-10, -10], pierna: [160, 195] })], BARRA),
  arrancada_mancuerna: ambos([pie({ tronco: 50, brazo: [190, 190], pierna: [150, 195] }), pie({ brazo: [0, 0] })], MAN),
  tiron_alto: ambos([pie({ tronco: 30, brazo: [180, 180], pierna: [165, 190] }), pie({ tronco: -3, brazo: [250, 120], pie: 140, elevado: 3 })], BARRA),

  // ── Core
  plancha: ambos(plancha, ESTERILLA),
  plancha_rodillas: ambos([prono({ tronco: 75, brazo: [180, 90], pierna: [240, 285], pie: 0 }), prono({ tronco: 75, brazo: [180, 90], pierna: [240, 285], pie: 0 })], ESTERILLA),
  plancha_pierna: ambos([plancha[0], prono({ tronco: 82, brazo: [180, 90], pierna: [257, 257], pierna2: [275, 275] })], ESTERILLA),
  plancha_a_manos: ambos([plancha[0], prono()], ESTERILLA),
  plancha_remo: ambos([prono(), prono({ brazo: [180, 180], brazo2: [250, 160] })], MAN, MAN2),
  plancha_lateral: ambos([{ tronco: 70, cabeza: 75, brazo: [180, 90], pierna: [250, 250], pie: 270 }, { tronco: 70, cabeza: 75, brazo: [180, 90], brazo2: [0, 0], pierna: [250, 250], pie: 270 }], ESTERILLA),
  plancha_lateral_rodillas: ambos([{ tronco: 62, cabeza: 66, brazo: [180, 90], pierna: [235, 300], pie: 300 }, { tronco: 62, cabeza: 66, brazo: [180, 90], brazo2: [0, 0], pierna: [235, 300], pie: 300 }], ESTERILLA),
  crunch: ambos([supino({ brazo: [40, 120] }), supino({ tronco: -60, cabeza: -50, brazo: [40, 120] })], ESTERILLA),
  crunch_maquina: ambos([sentado({ tronco: -5, brazo: [160, 10] }), sentado({ tronco: 35, cabeza: 50, brazo: [190, 30] })], asiento(), { t: 'almohadilla', en: 'hombro' }),
  crunch_polea: ambos([deRodillas({ tronco: 10, brazo: [160, 30] }), deRodillas({ tronco: 80, cabeza: 110, brazo: [200, 70] })], polea([28, -60])),
  situp: ambos([supino({ brazo: [40, 120] }), supino({ tronco: 5, cabeza: 20, brazo: [100, 100] })], ESTERILLA),
  codo_rodilla: ambos([supino({ brazo: [40, 120], pierna: [60, 100] }), supino({ tronco: -55, cabeza: -45, brazo: [40, 120], pierna: [20, 100] })], ESTERILLA),
  recogimiento: ambos([{ tronco: -30, brazo: [225, 180], pierna: [80, 80], pie: 80 }, { tronco: -15, brazo: [215, 180], pierna: [25, 160], pie: 90 }], ESTERILLA),
  elevacion_colgado: ambos([pie({ brazo: [0, 0], elevado: 3 }), pie({ brazo: [0, 0], pierna: [90, 90], elevado: 14 })], { t: 'barra_fija' }),
  elevacion_rodillas: ambos([pie({ brazo: [180, 90], elevado: 26 }), pie({ brazo: [180, 90], pierna: [60, 180], elevado: 30 })], { t: 'paralelas', en: 'codo' }),
  elevacion_polea: ambos([supino({ brazo: [270, 270], pierna: [92, 92] }), supino({ brazo: [270, 270], pierna: [30, 120] })], polea([72, 0], 'tobillo')),
  rueda: ambos([deRodillas({ tronco: 70, brazo: [180, 180] }), deRodillas({ tronco: 95, cabeza: 95, brazo: [85, 85] })], { t: 'rueda' }),
  tijeras: ambos([supino({ brazo: [90, 90], pierna: [70, 70], pierna2: [88, 88], cabeza: -70 }), supino({ brazo: [90, 90], pierna: [88, 88], pierna2: [70, 70], cabeza: -70 })], ESTERILLA),
  hundred: ambos([supino({ tronco: -80, cabeza: -60, brazo: [92, 92], pierna: [30, 120] }), supino({ tronco: -80, cabeza: -60, brazo: [105, 105], pierna: [30, 120] })], ESTERILLA),
  lenador_bajo: ambos([pie({ tronco: -5, brazo: [-30, -30] }), pie({ tronco: 15, brazo: [150, 150], pierna: [165, 190] })], polea([-30, -60])),
  lenador_alto: ambos([pie({ tronco: 20, brazo: [200, 200], pierna: [165, 190] }), pie({ tronco: -5, brazo: [30, 30] })], polea([-30, 30])),
  lenador_rodillas: ambos([deRodillas({ brazo: [-30, -30] }), deRodillas({ tronco: 15, brazo: [150, 150] })], polea([-30, -50])),
  rotacion_polea: ambos([pie({ brazo: [60, 60] }), pie({ brazo: [120, 120] })], polea([-36, -28])),
  rotacion_disco: ambos([{ tronco: -35, brazo: [130, 60], pierna: [60, 120], pie: 90 }, { tronco: -35, brazo: [160, 100], pierna: [60, 120], pie: 90 }], { t: 'disco' }),
  flexion_lateral: ambos([pie({}), pie({ tronco: -8, brazo: [195, 195] })], MAN),

  // ── Saltos y HIIT
  salto_cajon: ambos([sentadilla({ brazo: [210, 210] }), pie({ elevado: 22, brazo: [60, 40], pierna: [140, 200] })], { t: 'cajon', x: 22, alto: 22, ancho: 22 }),
  salto_lateral_cajon: ambos([sentadilla({ tronco: 25, brazo: [200, 200] }), pie({ elevado: 30, brazo: [60, 40], pierna: [130, 220], x: 16 })], { t: 'cajon', x: 30, alto: 18, ancho: 18 }),
  burpee: [prono(), saltoArriba()],
  sprint_polea: ambos([pie({ tronco: 30, brazo: [60, 20], brazo2: [220, 180], pierna: [100, 160], pierna2: [200, 220] }), pie({ tronco: 30, brazo: [220, 180], brazo2: [60, 20], pierna: [200, 220], pierna2: [100, 160] })], polea([-30, 28], 'cadera')),
  jumping_jacks: [pie({ brazo: [175, 175] }), pie({ brazo: [10, 10], pierna: [190, 190], elevado: 4 })],
  talones_gluteo: [pie({ brazo: [150, 30], pierna2: [190, 340], pie2: 300 }), pie({ brazo2: [150, 30], brazo: [200, 160], pierna: [190, 340], pie: 300, pierna2: [180, 180] })],
  escalador: [prono({ pierna: [140, 230], pie: 180 }), prono({ pierna2: [140, 230], pie2: 180 })],
  skipping_polea: ambos([pie({ tronco: 10, brazo: [60, 20], pierna: [90, 180], elevado: 3 }), pie({ tronco: 10, brazo: [200, 180], brazo2: [60, 20], pierna2: [90, 180], elevado: 3 })], polea([-30, 28], 'cadera')),
  sprint_lateral: ambos([pie({ tronco: 15, brazo: [150, 90], pierna: [150, 190], pierna2: [210, 170] }), pie({ tronco: 15, brazo: [150, 90], pierna: [170, 180], pierna2: [185, 180] })], polea([-30, 28], 'cadera')),
  saltos_kb: ambos([sentadilla({ tronco: 25, brazo: [150, 30] }), pie({ tronco: 15, brazo: [150, 30], pierna: [150, 195], elevado: 10 })], KB),

  // ── Cardio
  cinta: ambos([pie({ tronco: 6, brazo: [140, 60], brazo2: [210, 130], pierna: [150, 200], pierna2: [200, 230], elevado: 5 }), pie({ tronco: 6, brazo: [210, 130], brazo2: [140, 60], pierna: [200, 230], pierna2: [150, 200], elevado: 5 })], { t: 'cinta' }),
  bici: ambos([sentado({ tronco: 30, brazo: [130, 110], pierna: [110, 200], pierna2: [150, 160] }), sentado({ tronco: 30, brazo: [130, 110], pierna: [150, 160], pierna2: [110, 200] })], { t: 'bici' }),
  bici_reclinada: ambos([sentado({ tronco: -25, brazo: [170, 150], pierna: [70, 120], pierna2: [100, 100], pie: 30 }), sentado({ tronco: -25, brazo: [170, 150], pierna: [100, 100], pierna2: [70, 120], pie: 30 })], asiento()),
  eliptica: ambos([pie({ tronco: 5, brazo: [130, 60], brazo2: [170, 80], pierna: [160, 190], pierna2: [195, 185], elevado: 5 }), pie({ tronco: 5, brazo: [170, 80], brazo2: [130, 60], pierna: [195, 185], pierna2: [160, 190], elevado: 5 })], { t: 'eliptica' }),
  remoergometro: ambos([sentado({ tronco: 25, brazo: [100, 95], pierna: [50, 140], pie: 30 }), sentado({ tronco: -25, brazo: [210, 95], pierna: [88, 92], pie: 60 })], { t: 'remo' }),
  escaladora: ambos([pie({ tronco: 8, brazo: [140, 100], pierna: [130, 190], elevado: 8 }), pie({ tronco: 8, brazo: [140, 100], pierna2: [130, 190], elevado: 8 })], { t: 'escaladora' }),

  // ── Movilidad
  gusano: [pie({ tronco: 150, cabeza: 170, brazo: [180, 180], pierna: [185, 185] }), prono()],
  estiramiento_dorsal: [
    pie({ tronco: 30, brazo: [95, 95], pierna: [165, 185], material: [{ t: 'cajon', x: 55, alto: 74, ancho: 8 }] }),
    pie({ tronco: 90, cabeza: 95, brazo: [80, 80], pierna: [170, 180], material: [{ t: 'cajon', x: 72, alto: 52, ancho: 8 }] }),
  ],

  // ── Máquinas Matrix (catalogo/matrix.ts)
  press_inclinado_maquina: ambos(pressInclinado, { t: 'banco', desde: 'cadera', hasta: 'hombro', inclinado: true }, AGARRE),
  press_inclinado_barra: ambos(pressInclinado, { t: 'banco', desde: 'cadera', hasta: 'hombro', inclinado: true }, BARRA),
  press_declinado_maquina: ambos([sentado({ tronco: -12, brazo: [200, 110] }), sentado({ tronco: -12, brazo: [118, 122] })], asiento(), AGARRE),
  press_declinado_barra: ambos(
    [
      { tronco: -100, cabeza: -100, brazo: [0, 0], pierna: [70, 175], pie: 60 },
      { tronco: -100, cabeza: -100, brazo: [125, 5], pierna: [70, 175], pie: 60 },
    ],
    { t: 'banco', desde: 'cadera', hasta: 'hombro', inclinado: true },
    BARRA,
  ),
  press_hombros_barra_sentado: ambos(pressHombros, asiento(), BARRA),
  elevacion_lateral_maquina: ambos([sentado({ brazo: [178, 90] }), sentado({ brazo: [95, 90] })], asiento(), { t: 'almohadilla', en: 'codo' }),
  remo_alto_maquina: ambos([sentado({ tronco: 8, brazo: [30, 25] }), sentado({ tronco: 0, brazo: [200, 120] })], asiento(), AGARRE),
  curl_scott: ambos([sentado({ tronco: 12, brazo: [135, 130] }), sentado({ tronco: 12, brazo: [135, 25] })], { t: 'asiento' }, { t: 'almohadilla', en: 'codo' }, BARRA),
  triceps_extension_maquina: ambos([sentado({ brazo: [105, 15] }), sentado({ brazo: [105, 100] })], asiento(), { t: 'almohadilla', en: 'codo' }, AGARRE),
  rotacion_maquina: ambos([sentado({ brazo: [70, 40] }), sentado({ tronco: -6, brazo: [120, 95] })], asiento()),
  dominada_asistida: ambos([deRodillas({ brazo: [3, 0], elevado: 22 }), deRodillas({ tronco: 8, brazo: [160, 15], elevado: 44 })], { t: 'barra_fija' }, { t: 'almohadilla', en: 'rodilla' }),
  fondos_asistidos: ambos([deRodillas({ tronco: 5, brazo: [178, 178], elevado: 20 }), deRodillas({ tronco: 14, brazo: [235, 175], elevado: 6 })], { t: 'paralelas' }, { t: 'almohadilla', en: 'rodilla' }),
  gemelos_prensa: [
    { tronco: -55, cabeza: -45, brazo: [150, 160], pierna: [65, 65], pie: 40, material: [{ t: 'banco', desde: 'cadera', hasta: 'hombro', inclinado: true }, { t: 'almohadilla', en: 'tobillo' }] },
    { tronco: -55, cabeza: -45, brazo: [150, 160], pierna: [65, 65], pie: 345, material: [{ t: 'banco', desde: 'cadera', hasta: 'hombro', inclinado: true }, { t: 'almohadilla', en: 'tobillo' }] },
  ],
  gemelos_sentado_maquina: ambos([sentado({ brazo: [160, 160] }), sentado({ brazo: [160, 160], pie: 150 })], asiento(false), { t: 'almohadilla', en: 'rodilla' }),
  aduccion_maquina: ambos([sentado({ brazo: [175, 175], pierna: [80, 175] }), sentado({ brazo: [175, 175], pierna: [92, 182] })], asiento(), { t: 'almohadilla', en: 'rodilla' }),
  abduccion_maquina: ambos([sentado({ brazo: [175, 175], pierna: [92, 182] }), sentado({ brazo: [175, 175], pierna: [80, 175] })], asiento(), { t: 'almohadilla', en: 'rodilla' }),
  sentadilla_hack: ambos([pie({ tronco: -10, brazo: ESPALDA }), sentadilla({ tronco: 8, brazo: ESPALDA, pierna: [85, 200] })], { t: 'banco', desde: 'cadera', hasta: 'hombro', inclinado: true }, { t: 'almohadilla', en: 'hombro' }),
  sentadilla_cinturon: ambos([pie({ brazo: [135, 95] }), sentadilla({ tronco: 22, brazo: [135, 95] })], { t: 'almohadilla', en: 'cadera' }, AGARRE),
  zancada_maquina: ambos(zancadaPar({ brazo: [160, 40] }), { t: 'almohadilla', en: 'hombro' }, AGARRE),
  hip_thrust_maquina: ambos([{ tronco: -75, cabeza: -80, brazo: [90, 90], pierna: [40, 170] }, { tronco: -95, cabeza: -85, brazo: [90, 90], pierna: [80, 178] }], { t: 'cajon', x: -38, alto: 26, ancho: 14 }, { t: 'almohadilla', en: 'cadera' }),
  hip_thrust_pie: ambos([pie({ tronco: 45, pierna: [160, 190], brazo: [150, 100] }), pie({ tronco: -4, brazo: [150, 100] })], { t: 'almohadilla', en: 'cadera' }),
  lumbar_maquina: ambos([sentado({ tronco: 30, brazo: [150, 40] }), sentado({ tronco: -18, brazo: [150, 40] })], asiento(false), { t: 'almohadilla', en: 'hombro' }),
  hiperextension_45: ambos(
    [
      { tronco: 165, cabeza: 170, brazo: [150, 30], pierna: [225, 225], pie: 135 },
      { tronco: 45, cabeza: 50, brazo: [150, 30], pierna: [225, 225], pie: 135 },
    ],
    { t: 'almohadilla', en: 'cadera' },
  ),
  hiperextension_inversa: ambos(
    [
      { tronco: 90, cabeza: 92, brazo: [180, 180], pierna: [180, 180], pie: 90, elevado: 2 },
      { tronco: 90, cabeza: 92, brazo: [180, 180], pierna: [268, 268], pie: 270, elevado: 16 },
    ],
    { t: 'banco', desde: 'cadera', hasta: 'hombro' },
  ),
  trineo: ambos(
    [pie({ tronco: 50, brazo: [100, 95], pierna: [110, 200], pierna2: [205, 235] }), pie({ tronco: 50, brazo: [100, 95], pierna: [205, 235], pierna2: [110, 200] })],
    { t: 'cajon', bajo: 'mano', ancho: 8 },
  ),
};
