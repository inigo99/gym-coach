import { sql } from 'drizzle-orm';

import { EJERCICIOS } from '@/catalogo';
import { db } from '.';
import * as schema from './schema';

/** Inserta o actualiza el catálogo. Idempotente; no toca los ejercicios del usuario. */
export function sembrarCatalogo() {
  db.insert(schema.ejercicio)
    .values(
      EJERCICIOS.map((e) => ({
        id: e.id,
        nombre: e.nombreCompleto,
        registro: e.registro,
        equipo: e.equipo[0],
        musculosPrincipales: e.principales,
        musculosSecundarios: e.secundarios,
        idOrigen: null,
        imagenesOrigen: null,
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
