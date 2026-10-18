# gym-coach

App móvil (Android e iOS) para registrar el entrenamiento en el gimnasio: perfil y mediciones, series de fuerza y cardio, rutinas con horario y avisos, gráficas de progreso, fichas de técnica con mapa muscular y nivel por grupo muscular. Funciona sin conexión: los datos se guardan en el móvil (SQLite).

> Estado: v1.3.0. Catálogo de 56 ejercicios con 179 variantes (español e inglés) e ilustraciones propias; buscador con el material primero; generador de rutinas y alternativas; programas de 4–12 semanas para perder peso, ganar músculo o definir, con pauta semanal, cardio, seguimiento y alimentación orientativa (reglas fijas, sin IA).

## Stack

Expo (React Native) + TypeScript · expo-router · expo-sqlite + Drizzle ORM · expo-notifications (locales) · react-native-svg (gráficas) · Jest. En web, sql.js. En el móvil, solo librerías incluidas en **Expo Go**.

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

## Estructura

```
src/app/        pantallas (expo-router): (tabs)/ con una pila por pestaña — (entrenar), (rutinas) con rutina/[id], rutina/sugerir y programa/, (ejercicios), (progreso) con Cuerpo, (perfil); ejercicio/[id] dentro de cada pestaña
src/pantallas/  pantallas compartidas entre pestañas (ficha de ejercicio: técnica, músculos, nivel, progreso, alternativas)
src/notificaciones.ts  avisos del horario (semanales) y del fin del descanso
src/catalogo/   familias de ejercicios con sus variantes, técnica y buscador
src/ilustracion/ figura de perfil, material y poses de inicio y final de cada ejercicio
src/hooks/      useNiveles (nivel por ejercicio de las últimas 8 semanas)
src/db/         esquema Drizzle, cliente, semilla del catálogo y funciones de sesión
src/components/ piezas de UI (tarjeta de ejercicio, cronómetros, selector)
src/domain/     cálculos puros con tests (1RM, volumen, sesión, horario, progreso, niveles)
assets/data/    catálogo de ejercicios y grupos musculares
drizzle/        migraciones generadas
```

## Distribución

**iPhone (app web instalable, gratis):** abre [inigo99.github.io/gym-coach](https://inigo99.github.io/gym-coach/) en Safari → botón Compartir → **Añadir a pantalla de inicio**. Queda como una app más, a pantalla completa y funciona sin conexión. Se publica sola con cada cambio en `master` (`.github/workflows/web.yml`, GitHub Pages).

- Los datos se guardan en el iPhone, dentro de la app web (SQLite con [sql.js](https://github.com/sql-js/sql.js) en IndexedDB; en el móvil Android se usa expo-sqlite). Haz copias en Perfil → Copia de seguridad: si se borra la app o los datos de Safari, se pierden.
- En la app web no hay avisos del horario ni del descanso (Safari no permite notificaciones programadas sin servidor).
- Para probarla en local: `npm run web:export && npx expo serve`.

Para desarrollo también vale Expo Go: `npx expo start` y escanear el QR.

**Android (APK):** se descarga de [Releases](https://github.com/inigo99/gym-coach/releases/latest). Lo genera GitHub Actions (`.github/workflows/apk.yml`): al subir a `master` un cambio de `expo.version` en `app.json` compila el APK y crea la Release `v{versión}` con él. También se puede lanzar a mano desde la pestaña Actions.

Para firmar siempre con la misma clave (y poder instalar actualizaciones encima sin borrar la app), añade en el repo los secretos `ANDROID_KEYSTORE_B64` (keystore PKCS12 en base64, alias `gymcoach`) y `ANDROID_KEYSTORE_PASSWORD`. Sin ellos se firma con la clave de depuración. El APK incluye solo código para `arm64-v8a` (prácticamente todos los móviles Android actuales).

## Copia de seguridad

Los datos solo están en el móvil. En **Perfil → Copia de seguridad** se exporta un JSON (para guardarlo en Archivos, Drive o correo) y se importa en otro móvil. La importación sustituye todos los datos y es de todo o nada: si la copia trae algo inválido, no se cambia nada.

## Datos de ejercicios

- **Catálogo** (`src/catalogo/datos.ts`): cada familia (por ejemplo, *Press de pecho*) agrupa sus variantes (barra, mancuernas, máquina, Smith, polea…), cada una con su forma de registrar, material, músculos y técnica. Nombres en español e inglés; los nombres de las máquinas Technogym son alias para el buscador. Los textos son propios.
- **Ilustraciones** (`src/ilustracion/`): dibujos propios generados por código, con el mismo estilo que el mapa muscular. Muestran la posición inicial y la final, el material y los músculos que trabajan (principales en naranja, secundarios en granate). No hay imágenes de terceros.
- **Músculos de los 36 ejercicios originales:** [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (*Unlicense*).
- **Niveles** (`assets/data/niveles.json`): umbrales de 1RM relativo al peso corporal (o repeticiones en ejercicios con peso corporal) por sexo de [Strength Level](https://strengthlevel.com/strength-standards), consultados el 14-10-2026. Principiante ≈ más fuerte que el 5 % de sus usuarios, novato 20 %, intermedio 50 %, avanzado 80 % y élite 95 %. Es una comparación con gente que entrena y registra sus marcas, no con toda la población.

## Aviso

Información orientativa; no sustituye a un entrenador ni a un profesional sanitario.

## Licencia

MIT
