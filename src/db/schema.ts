import { index, integer, primaryKey, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import type { Registro } from '@/domain/calculos';

/** Una sola fila (id = 1). */
export const perfil = sqliteTable('perfil', {
  id: integer('id').primaryKey(),
  nombre: text('nombre'),
  nacimiento: text('nacimiento'), // AAAA-MM-DD
  sexo: text('sexo', { enum: ['h', 'm'] }),
  alturaCm: real('altura_cm'),
});

export const medicion = sqliteTable('medicion', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  fecha: text('fecha').notNull(), // AAAA-MM-DD
  pesoKg: real('peso_kg').notNull(),
  grasaPct: real('grasa_pct'),
});

export const ejercicio = sqliteTable('ejercicio', {
  id: text('id').primaryKey(), // 'cat:…' (catálogo) | 'user:…'
  nombre: text('nombre').notNull(),
  registro: text('registro').$type<Registro>().notNull(),
  equipo: text('equipo').notNull(),
  musculosPrincipales: text('musculos_principales', { mode: 'json' }).$type<string[]>().notNull(),
  musculosSecundarios: text('musculos_secundarios', { mode: 'json' }).$type<string[]>().notNull(),
  idOrigen: text('id_origen'),
  imagenesOrigen: text('imagenes_origen', { mode: 'json' }).$type<string[]>(),
});

export type Perfil = typeof perfil.$inferSelect;
export type Medicion = typeof medicion.$inferSelect;
export type Ejercicio = typeof ejercicio.$inferSelect;

export const rutina = sqliteTable('rutina', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre').notNull(),
});

export const rutinaEjercicio = sqliteTable(
  'rutina_ejercicio',
  {
    rutinaId: integer('rutina_id').notNull().references(() => rutina.id, { onDelete: 'cascade' }),
    ejercicioId: text('ejercicio_id').notNull().references(() => ejercicio.id),
    orden: integer('orden').notNull(),
    series: integer('series').notNull().default(3),
    repsMin: integer('reps_min'), // en tiempo/cardio: null
    repsMax: integer('reps_max'),
    descansoS: integer('descanso_s').notNull().default(90),
  },
  (t) => [primaryKey({ columns: [t.rutinaId, t.ejercicioId] })],
);

/** Una rutina como mucho por día de la semana (1 = lunes … 7 = domingo). */
export const horario = sqliteTable('horario', {
  dia: integer('dia').primaryKey(),
  rutinaId: integer('rutina_id').notNull().references(() => rutina.id, { onDelete: 'cascade' }),
  hora: integer('hora').notNull(),
  minuto: integer('minuto').notNull(),
});

export const sesion = sqliteTable('sesion', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  inicio: text('inicio').notNull(), // ISO
  fin: text('fin'), // null = en curso
  rutinaId: integer('rutina_id').references(() => rutina.id, { onDelete: 'set null' }),
});

/** Ejercicios de la sesión, en orden (también los que aún no tienen series). */
export const sesionEjercicio = sqliteTable(
  'sesion_ejercicio',
  {
    sesionId: integer('sesion_id').notNull().references(() => sesion.id, { onDelete: 'cascade' }),
    ejercicioId: text('ejercicio_id').notNull().references(() => ejercicio.id),
    orden: integer('orden').notNull(),
  },
  (t) => [primaryKey({ columns: [t.sesionId, t.ejercicioId] })],
);

export const serie = sqliteTable(
  'serie',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    sesionId: integer('sesion_id').notNull().references(() => sesion.id, { onDelete: 'cascade' }),
    ejercicioId: text('ejercicio_id').notNull().references(() => ejercicio.id),
    pesoKg: real('peso_kg'), // carga, o lastre en peso_corporal
    reps: integer('reps'),
    duracionS: integer('duracion_s'),
    distanciaM: real('distancia_m'),
    calentamiento: integer('calentamiento', { mode: 'boolean' }).notNull().default(false),
  },
  (t) => [index('serie_ejercicio_idx').on(t.ejercicioId, t.sesionId)],
);

export type Sesion = typeof sesion.$inferSelect;
export type Serie = typeof serie.$inferSelect;
export type Rutina = typeof rutina.$inferSelect;
export type RutinaEjercicio = typeof rutinaEjercicio.$inferSelect;
export type Horario = typeof horario.$inferSelect;

/** Programa de varias semanas. Como mucho uno activo (fin = null). */
export const programa = sqliteTable('programa', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  objetivo: text('objetivo', { enum: ['perder_peso', 'musculo', 'definir'] }).notNull(),
  dias: integer('dias').notNull(),
  semanas: integer('semanas').notNull(),
  nivel: text('nivel', { enum: ['principiante', 'intermedio', 'avanzado'] }).notNull(),
  material: text('material', { enum: ['gimnasio', 'mancuernas', 'casa'] }).notNull(),
  minutos: integer('minutos').notNull(),
  inicio: text('inicio').notNull(), // AAAA-MM-DD, lunes de la primera semana
  fin: text('fin'), // AAAA-MM-DD si se terminó antes; null = activo
});

/** Rutinas creadas por el programa y el día de la semana de cada una. */
export const programaRutina = sqliteTable(
  'programa_rutina',
  {
    programaId: integer('programa_id').notNull().references(() => programa.id, { onDelete: 'cascade' }),
    rutinaId: integer('rutina_id').notNull().references(() => rutina.id, { onDelete: 'cascade' }),
    dia: integer('dia').notNull(), // 1 = lunes … 7 = domingo
  },
  (t) => [primaryKey({ columns: [t.programaId, t.rutinaId] })],
);

export type Programa = typeof programa.$inferSelect;
