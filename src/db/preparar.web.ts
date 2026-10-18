import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import { useEffect, useState } from 'react';

import migrations from '../../drizzle/migrations';
import { abrir, db, listo } from './conexion.web';

/** Abre la base de datos del navegador y aplica las migraciones pendientes (mismas que en el móvil). */
export function usePrepararBD() {
  const [estado, setEstado] = useState<{ success: boolean; error?: Error }>({ success: false });
  useEffect(() => {
    abrir()
      .then(() => migrate(db, migrations))
      .then(listo)
      .then(() => setEstado({ success: true }))
      .catch((error: Error) => setEstado({ success: false, error }));
  }, []);
  return estado;
}
