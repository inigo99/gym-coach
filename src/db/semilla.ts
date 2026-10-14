import { sql } from 'drizzle-orm';

import catalogo from '../../assets/data/ejercicios.json';
import { db } from '.';
import * as schema from './schema';

/** Inserta o actualiza el catálogo. Idempotente; no toca los ejercicios del usuario. */
export function sembrarCatalogo() {
  db.insert(schema.ejercicio)
    .values(
      catalogo.map((e) => ({
        id: e.id,
        nombre: e.nombre,
        registro: e.registro as schema.Ejercicio['registro'],
        equipo: e.equipo,
        musculosPrincipales: e.musculos_principales,
        musculosSecundarios: e.musculos_secundarios,
        idOrigen: e.id_origen,
        imagenesOrigen: e.imagenes_origen,
      })),
    )
    .onConflictDoUpdate({
      target: schema.ejercicio.id,
      set: {
        nombre: sql`excluded.nombre`,
        registro: sql`excluded.registro`,
        equipo: sql`excluded.equipo`,
        musculosPrincipales: sql`excluded.musculos_principales`,
        musculosSecundarios: sql`excluded.musculos_secundarios`,
        idOrigen: sql`excluded.id_origen`,
        imagenesOrigen: sql`excluded.imagenes_origen`,
      },
    })
    .run();
}
