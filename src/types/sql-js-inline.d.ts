// La variante "inline" lleva el WebAssembly dentro del JS: no hay que servir el .wasm aparte.
declare module 'sql.js/dist/sql-wasm-inline.js' {
  export * from 'sql.js';
  export { default } from 'sql.js';
}
