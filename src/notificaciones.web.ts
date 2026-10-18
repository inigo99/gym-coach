// En la app web no hay avisos programados (Safari no los permite sin servidor de notificaciones).
type FilaHorario = { dia: number; hora: number; minuto: number; nombre: string };

export const pedirPermiso = async () => false;
export const reprogramarHorario = async (_filas: FilaHorario[]) => {};
export const avisarDescanso = (_segundos: number) => () => {};
