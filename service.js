const config = require('config');
const express = require('express');
const bodyParser = require('body-parser');
const createDebug = require('debug');

const lokiDB = require('./core/db');
const serviceCreator = require('./core/services/blockchain');

const log = createDebug(`${config.app.name}:service:log`);
const error = createDebug(`${config.app.name}:service:error`);

const app = express();

app.use(bodyParser.json());

lokiDB((db) => {
  const blockchainService = serviceCreator(db);

  app.get('/blocks', (req, res) =>
    res.json(blockchainService.blocks()));

  app.get(['/balance', '/balance/:address'], async (req, res) => {
    const result = await blockchainService.balance(req.params.address);
    res.json(result);
  });

  app.post('/mine', async (req, res) => {
    const result = await blockchainService.mine(req.body);
    res.json(result);
  });

  app.post('/transaction', async (req, res) =>
    res.json(blockchainService.transactionAdd(req.body)));

  app.get('/transactions', async (req, res) =>
    res.json(blockchainService.transactionsList(req.body)));

  app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    error('server error', err);
    res.send(err.message || err);
  });

  app.listen(config.server.port, () => {
    log(`${config.app.name} v${config.app.version} started`);
    log(`waiting connections on http://0.0.0.0:${config.server.port}`);
  });
});
