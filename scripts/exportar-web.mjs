// Exporta la app web en dist/ lista para un hosting estático (GitHub Pages).
// Uso: BASE_URL=/gym-coach node scripts/exportar-web.mjs   (sin BASE_URL, en la raíz)
import { execSync } from 'node:child_process';
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';

const base = (process.env.BASE_URL ?? '').replace(/\/$/, '') + '/';
execSync('npx expo export -p web', { stdio: 'inherit' });
const html = readFileSync('dist/index.html', 'utf8').replaceAll('%BASE%', base);
writeFileSync('dist/index.html', html);
copyFileSync('dist/index.html', 'dist/404.html'); // rutas profundas de la SPA en GitHub Pages
writeFileSync('dist/.nojekyll', ''); // Expo genera carpetas con guion bajo
console.log(`Web exportada en dist/ para ${base}`);
