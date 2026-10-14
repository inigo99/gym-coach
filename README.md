# gym-coach

App móvil (Android e iOS) para registrar el entrenamiento en el gimnasio: perfil y mediciones, series de fuerza y cardio, rutinas con horario y avisos, gráficas de progreso, fichas de técnica con mapa muscular y nivel por grupo muscular. Funciona sin conexión: los datos se guardan en el móvil (SQLite).

> Estado: v1 (S6). Registro de sesiones de fuerza y cardio con descanso y avisos, rutinas con horario semanal, progreso con gráficas y récords, fichas de técnica de 36 ejercicios con mapa muscular, nivel por ejercicio y grupo muscular, y copia de seguridad.

## Stack

Expo (React Native) + TypeScript · expo-router · expo-sqlite + Drizzle ORM · expo-notifications (locales) · react-native-svg (gráficas) · Jest. Solo librerías incluidas en **Expo Go**.

## Arrancar

```bash
npm install
npx expo start          # escanear el QR con la app Expo Go (iPhone) o abrir el emulador de Android
```

## Comandos

| Comando | Qué hace |
|---|---|
| `npm test` | Tests: dominio, catálogo y base de datos (migraciones reales sobre better-sqlite3) |
| `npm run lint` / `npm run typecheck` | Calidad |
| `npm run db:generate -- --name <nombre>` | Nueva migración tras cambiar `src/db/schema.ts` |
| `npm run catalogo` | Regenera `assets/data/ejercicios.json` desde free-exercise-db |

## Estructura

```
src/app/        pantallas (expo-router): (tabs)/ Entrenar, Rutinas, Progreso, Cuerpo, Perfil; rutina/[id] editor; ejercicio/[id] ficha (técnica, músculos, nivel, progreso)
src/notificaciones.ts  avisos del horario (semanales) y del fin del descanso
src/hooks/      useNiveles (nivel por ejercicio de las últimas 8 semanas)
src/db/         esquema Drizzle, cliente, semilla del catálogo y funciones de sesión
src/components/ piezas de UI (tarjeta de ejercicio, cronómetros, selector)
src/domain/     cálculos puros con tests (1RM, volumen, sesión, horario, progreso, niveles)
assets/data/    catálogo de ejercicios y grupos musculares
drizzle/        migraciones generadas
```

## Distribución

**iPhone (Expo Go, gratis):**

```bash
npx eas-cli@latest login
npx eas-cli@latest init                    # una vez: crea el proyecto en Expo y añade su id a app.json
npx eas-cli@latest update --branch main    # publica la versión actual
```

Después se abre en Expo Go desde la sesión de Expo, sin el PC encendido.

**Android (APK):** se descarga de [Releases](https://github.com/inigo99/gym-coach/releases/latest). Se genera con GitHub Actions al publicar una Release (con su etiqueta, p. ej. `v1.0.1`) y se adjunta a ella:

```bash
gh release create v1.0.1 --target master --title "gym-coach v1.0.1" --notes "Cambios…"
```

Para firmar siempre con la misma clave (y poder instalar actualizaciones encima sin borrar la app), añade en el repo los secretos `ANDROID_KEYSTORE_B64` (keystore PKCS12 en base64, alias `gymcoach`) y `ANDROID_KEYSTORE_PASSWORD`. Sin ellos se firma con la clave de depuración.

## Copia de seguridad

Los datos solo están en el móvil. En **Perfil → Copia de seguridad** se exporta un JSON (para guardarlo en Archivos, Drive o correo) y se importa en otro móvil. La importación sustituye todos los datos y es de todo o nada: si la copia trae algo inválido, no se cambia nada.

## Datos de ejercicios

- **Músculos y fotos:** [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (declarado *Unlicense*). La procedencia de sus fotos no está documentada, así que no se incluyen en el repo: la app las carga desde ese repositorio solo para uso personal.
- **Técnica** (`assets/data/tecnica.json`): textos propios en español.
- **Niveles** (`assets/data/niveles.json`): umbrales de 1RM relativo al peso corporal (o repeticiones en ejercicios con peso corporal) por sexo de [Strength Level](https://strengthlevel.com/strength-standards), consultados el 14-10-2026. Principiante ≈ más fuerte que el 5 % de sus usuarios, novato 20 %, intermedio 50 %, avanzado 80 % y élite 95 %. Es una comparación con gente que entrena y registra sus marcas, no con toda la población.

## Aviso

Información orientativa; no sustituye a un entrenador ni a un profesional sanitario.

## Licencia

MIT
