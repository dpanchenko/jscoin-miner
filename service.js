const config = require('config');
const express = require('express');
const createDebug = require('debug');

const log = createDebug(`${config.app.name}:service:log`);
const error = createDebug(`${config.app.name}:service:error`);

process.title = config.app.name;

const app = express();

app.use((req, res) => {
  res.send('ok');
});

app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  error('server error', err);
  res.send(err.message || err);
});

app.listen(config.server.port, () => {
  log(`${config.app.name} v${config.app.version} started`);
  log(`waiting connections on http://0.0.0.0:${config.server.port}`);
});
