import { addDatabaseChangeListener } from 'expo-sqlite';

/** Avisa cuando cambia cualquier tabla. En web: cambios.web.ts. */
export const alCambiar = (f: () => void) => addDatabaseChangeListener(f);
