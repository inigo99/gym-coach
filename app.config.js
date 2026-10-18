// Toma app.json y, solo al publicar la web en GitHub Pages, añade la subruta (BASE_URL=/gym-coach).
module.exports = ({ config }) => (process.env.BASE_URL ? { ...config, experiments: { ...config.experiments, baseUrl: process.env.BASE_URL } } : config);
