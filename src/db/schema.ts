import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

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
