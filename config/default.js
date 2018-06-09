const packageJson = require('../package.json');

module.exports = {
  app: {
    name: packageJson.name,
    version: packageJson.version,
  },
  server: {
    address: process.env.SERVER_ADDRESS || '0.0.0.0',
    port: parseInt(process.env.PORT, 10) || 8080,
    externalUrl: process.env.SERVER_EXTERNAL_URL,
  },
  miner: {
    output: process.env.MINER_OUTPUT,
    complexity: parseInt(process.env.COMPLEXITY, 10) || 0,
    pool: process.env.POOL_ADDRESS,
  },
  db: {
    path: process.env.LOKI_DB_PATH,
  },
};
