# gym-coach

App móvil (Android e iOS) para registrar el entrenamiento en el gimnasio: perfil y mediciones, series de fuerza y cardio, rutinas con horario y avisos, gráficas de progreso, fichas de técnica con mapa muscular y nivel por grupo muscular. Funciona sin conexión: los datos se guardan en el móvil (SQLite).

> Estado: S1 (base y datos). Perfil, mediciones y catálogo de 36 ejercicios.

## Stack

Expo (React Native) + TypeScript · expo-router · expo-sqlite + Drizzle ORM · Jest. Solo librerías incluidas en **Expo Go**.

## Arrancar

```bash
npm install
npx expo start          # escanear el QR con la app Expo Go (iPhone) o abrir el emulador de Android
```

## Comandos

| Comando | Qué hace |
|---|---|
| `npm test` | Tests (dominio y catálogo) |
| `npm run lint` / `npm run typecheck` | Calidad |
| `npm run db:generate -- --name <nombre>` | Nueva migración tras cambiar `src/db/schema.ts` |
| `npm run catalogo` | Regenera `assets/data/ejercicios.json` desde free-exercise-db |

## Estructura

```
src/app/        pantallas (expo-router)
src/db/         esquema Drizzle, cliente y semilla del catálogo
src/domain/     cálculos puros con tests (1RM, volumen, edad, IMC)
assets/data/    catálogo de ejercicios y grupos musculares
drizzle/        migraciones generadas
```

## Distribución

- **iPhone:** Expo Go (desarrollo) y EAS Update.
- **Android:** APK con `npx eas-cli@latest build -p android --profile preview`.

## Datos de ejercicios

Los músculos y las referencias a fotos salen de [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (declarado *Unlicense*). La procedencia de sus fotos no está documentada, así que de momento solo se usan en local; los nombres y textos en español son propios.

## Aviso

Información orientativa; no sustituye a un entrenador ni a un profesional sanitario.

## Licencia

MIT
