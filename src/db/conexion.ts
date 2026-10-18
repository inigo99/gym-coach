import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import * as schema from './schema';

// Móvil: SQLite nativo de Expo. En web se usa conexion.web.ts (sql.js).
const cliente = openDatabaseSync('gym-coach.db', { enableChangeListener: true });
cliente.execSync('PRAGMA foreign_keys = ON'); // para los ON DELETE CASCADE
export const db = drizzle(cliente, { schema });

/** En el móvil la base de datos ya está abierta. */
export const abrir = async () => {};
