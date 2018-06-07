const packageJson = require('../package.json');

module.exports = {
  app: {
    name: packageJson.name,
    version: packageJson.version,
  },
  server: {
    port: parseInt(process.env.PORT, 10) || 8080,
  },
  miner: {
    output: process.env.MINER_OUTPUT,
    complexity: parseInt(process.env.COMPLEXITY, 10) || 0,
  },
  db: {
    path: process.env.LOKI_DB_PATH,
  },
};
