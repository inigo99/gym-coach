import { eq } from 'drizzle-orm';

import { db } from './conexion';
import * as schema from './schema';

export { db };

export function guardarPerfil(datos: Omit<schema.Perfil, 'id'>) {
  db.insert(schema.perfil)
    .values({ id: 1, ...datos })
    .onConflictDoUpdate({ target: schema.perfil.id, set: datos })
    .run();
}

export function borrarMedicion(id: number) {
  db.delete(schema.medicion).where(eq(schema.medicion.id, id)).run();
}
