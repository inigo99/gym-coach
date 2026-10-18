/**
 * Web (app instalable en iPhone): SQLite compilado a WebAssembly con sql.js, en memoria,
 * guardado en IndexedDB tras cada cambio. La base de datos de Expo en web necesita cabeceras
 * COOP/COEP que GitHub Pages no permite.
 */
import { drizzle } from 'drizzle-orm/sql-js';
import type { Database } from 'sql.js';
import initSqlJs from 'sql.js/dist/sql-wasm-inline.js';

import { avisarCambio } from './cambios.web';
import type { db as DbNativa } from './conexion';
import * as schema from './schema';

let cliente: Database;
let real: ReturnType<typeof drizzle<typeof schema>>;

// Mismo objeto que en el móvil: se usa igual en toda la app una vez abierta.
export const db = new Proxy({}, { get: (_, k) => (real as unknown as Record<string | symbol, unknown>)[k] }) as typeof DbNativa;

// ── IndexedDB: un único registro con los bytes de la base de datos.
const almacen = () =>
  new Promise<IDBDatabase>((ok, ko) => {
    const r = indexedDB.open('gym-coach', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('datos');
    r.onsuccess = () => ok(r.result);
    r.onerror = () => ko(r.error);
  });
async function leer(): Promise<Uint8Array | undefined> {
  const idb = await almacen();
  return new Promise((ok, ko) => {
    const r = idb.transaction('datos').objectStore('datos').get('bd');
    r.onsuccess = () => ok(r.result);
    r.onerror = () => ko(r.error);
  });
}
async function escribir(bytes: Uint8Array) {
  const idb = await almacen();
  return new Promise<void>((ok, ko) => {
    const tx = idb.transaction('datos', 'readwrite');
    tx.objectStore('datos').put(bytes, 'bd');
    tx.oncomplete = () => ok();
    tx.onerror = () => ko(tx.error);
  });
}

/** PRAGMA y avisos de cambios. Hay que repetirlo tras export(), que cierra y reabre la base de datos. */
function configurar() {
  cliente.exec('PRAGMA foreign_keys = ON');
  cliente.create_function('avisar_cambio', () => {
    cambio();
    return null;
  });
  const tablas = cliente.exec("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '__drizzle%'")[0]?.values ?? [];
  for (const [t] of tablas)
    for (const op of ['INSERT', 'UPDATE', 'DELETE'])
      cliente.exec(`CREATE TEMP TRIGGER IF NOT EXISTS "aviso_${t}_${op}" AFTER ${op} ON main."${t}" BEGIN SELECT avisar_cambio(); END`);
}

// Tras un cambio: avisa a las pantallas y guarda en IndexedDB (agrupando los cambios seguidos).
let pendiente: ReturnType<typeof setTimeout> | undefined;
function cambio() {
  if (pendiente) return;
  pendiente = setTimeout(() => {
    pendiente = undefined;
    avisarCambio();
    guardar();
  }, 50);
}
let cola = Promise.resolve();
function guardar() {
  const bytes = cliente.export();
  configurar();
  cola = cola.then(() => escribir(bytes)).catch((e) => console.error('No se pudo guardar', e));
  return cola;
}

/** Abre (o crea) la base de datos guardada en el navegador. */
export async function abrir() {
  if (real) return;
  const [SQL, bytes] = await Promise.all([initSqlJs(), leer()]);
  cliente = new SQL.Database(bytes);
  real = drizzle(cliente, { schema });
  cliente.exec('PRAGMA foreign_keys = ON');
  navigator.storage?.persist?.().catch(() => {});
  // iOS puede cerrar la app web en segundo plano: guardar al ocultarla.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && pendiente) {
      clearTimeout(pendiente);
      pendiente = undefined;
      guardar();
    }
  });
}

/** Tras las migraciones: activa los avisos de cambios y guarda el esquema nuevo. */
export async function listo() {
  configurar();
  await guardar();
}
