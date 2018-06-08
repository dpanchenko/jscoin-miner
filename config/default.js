const packageJson = require('../package.json');

module.exports = {
  app: {
    name: packageJson.name,
    version: packageJson.version,
  },
  server: {
    address: process.env.SERVER_ADDRESS || '0.0.0.0',
    port: parseInt(process.env.PORT, 10) || 8080,
  },
  miner: {
    output: process.env.MINER_OUTPUT,
    complexity: parseInt(process.env.COMPLEXITY, 10) || 0,
    orchestrator: process.env.ORCHESTRATOR,
  },
  db: {
    path: process.env.LOKI_DB_PATH,
  },
};
