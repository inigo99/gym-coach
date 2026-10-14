/* eslint-disable @typescript-eslint/no-require-imports -- solo para tests (Node) */
// SQLite en memoria con las migraciones reales, para sustituir a ./index en los tests:
//   jest.mock('./index', () => require('./bd-prueba'));
const Database = require('better-sqlite3');
const { drizzle } = require('drizzle-orm/better-sqlite3');
const { migrate } = require('drizzle-orm/better-sqlite3/migrator');

const cliente = new Database(':memory:');
cliente.pragma('foreign_keys = ON');
export const db = drizzle(cliente, { schema: require('./schema') });
migrate(db, { migrationsFolder: 'drizzle' });
