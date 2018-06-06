const config = require('config');
const LokiJS = require('lokijs');
const createDebug = require('debug');

const log = createDebug(`${config.app.name}:db`);

const LOKI_DB_PATH = config.db.path;

if (!LOKI_DB_PATH) {
  throw new Error('Db path is not defined');
}

module.exports = (callback) => {
  const db = new LokiJS(LOKI_DB_PATH, {
    autoload: true,
    autoloadCallback: () => {
      log('Loki DB loaded successfully');
      callback(db);
    },
    autosave: true,
    autosaveInterval: 4000, // save every four seconds for our example
  });
};
