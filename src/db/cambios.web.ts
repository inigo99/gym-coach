const oyentes = new Set<() => void>();

/** Avisa cuando cambia cualquier tabla (lo dispara conexion.web.ts). */
export function alCambiar(f: () => void) {
  oyentes.add(f);
  return { remove: () => oyentes.delete(f) };
}

export const avisarCambio = () => oyentes.forEach((f) => f());
