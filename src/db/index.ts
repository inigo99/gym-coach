import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import * as schema from './schema';

const cliente = openDatabaseSync('gym-coach.db', { enableChangeListener: true });
cliente.execSync('PRAGMA foreign_keys = ON'); // para los ON DELETE CASCADE
export const db = drizzle(cliente, { schema });

export function guardarPerfil(datos: Omit<schema.Perfil, 'id'>) {
  db.insert(schema.perfil)
    .values({ id: 1, ...datos })
    .onConflictDoUpdate({ target: schema.perfil.id, set: datos })
    .run();
}

export function borrarMedicion(id: number) {
  db.delete(schema.medicion).where(eq(schema.medicion.id, id)).run();
}
