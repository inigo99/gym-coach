/** Web: menú de compartir del sistema si permite ficheros (iPhone: "Guardar en Archivos"); si no, descarga. */
export async function compartirJson(nombre: string, texto: string, _titulo: string) {
  const fichero = new File([texto], nombre, { type: 'application/json' });
  if (navigator.canShare?.({ files: [fichero] })) {
    try {
      await navigator.share({ files: [fichero] });
      return;
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
    }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(fichero);
  a.download = nombre;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
}

/** Pide un fichero con el selector del navegador y devuelve su texto (null si se cancela). */
export function elegirTexto(): Promise<string | null> {
  return new Promise((ok) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = () => (input.files?.[0] ? input.files[0].text().then(ok) : ok(null));
    input.oncancel = () => ok(null);
    input.click();
  });
}
