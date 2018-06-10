const config = require('config');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const createDebug = require('debug');
const socketIO = require('socket.io-client');
const request = require('request-promise-native');

const lokiDB = require('./core/db');
const sha256hash = require('./core/libs/hash');
const serviceCreator = require('./core/services/blockchain');

const log = createDebug(`${config.app.name}:service:log`);
const error = createDebug(`${config.app.name}:service:error`);

const app = express();

const socket = socketIO(config.miner.pool);

const minerId = sha256hash(`${config.server.address}:${config.server.port}`);

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(`${__dirname}/public`));

lokiDB((db) => {
  const blockchainService = serviceCreator(db);
  let minersPool = [];

  /**
   * @api {get} /blocks Get all blocks
   * @apiName Blocks
   * @apiGroup Default
   *
   * @apiSuccess {Array} blocks  List of blocks in blockchain.
   * @apiSuccess {String} tail  Hash of latest blockchain block.
   *
   * @apiSuccessExample Response
   *  HTTP/1.1 200 OK
   *  {
   *    "blocks": [
   *      {
   *        "index": 0,
   *        "timestamp": 1528473574328,
   *        "data": {
   *          "transactions": [
   *            {
   *              "input": "coinbase",
   *              "output": "miner-wallet-address",
   *              "amount": 10
   *            }
   *          ]
   *        },
   *        "nonce": 0,
   *        "previousHash": "",
   *        "hash": "1bc63b282d8144cfe88b13940b43957e4c58d5bef79f277eb901f79725080e08"
   *      },
   *      {
   *        "index": 2,
   *        "timestamp": 1528504967843,
   *        "data": {
   *          "transactions": [
   *            {
   *              "input": "miner-wallet-address",
   *              "output": "miner2-wallet-address",
   *              "amount": 2
   *            },
   *            {
   *              "input": "coinbase",
   *              "output": "miner-wallet-address",
   *              "amount": 1
   *            }
   *          ]
   *        },
   *        "nonce": 2,
   *        "previousHash": "0066f9b2fb8a673b560922071bed9718238fb8e10bf0aa8140631aff9dcd20e9",
   *        "hash": "0cf6af452aacc28a22f0c19b08d3eb417a335c1e4902b2f9852a4e44a279000d"
   *      }
   *    ],
   *    "tail": "0cf6af452aacc28a22f0c19b08d3eb417a335c1e4902b2f9852a4e44a279000d"
   *  }
   */
  app.get('/blocks', (req, res) =>
    res.json(blockchainService.blocks()));

  /**
   * @api {get} /balance/:address Get balance with transaction history
   * @apiName Balance
   * @apiGroup Default
   *
   * @apiParam {String} address  User wallet address.
   *
   * @apiSuccess {Array} blocks  List of blocks in blockchain.
   * @apiSuccess {String} tail  Hash of latest blockchain block.
   *
   * @apiSuccessExample Response
   *  HTTP/1.1 200 OK
   *  {
   *    "confirmed": {
   *      "amount": 8,
   *      "debet": [
   *        {
   *        "wallet": "coinbase",
   *        "amount": 10
   *        },
   *        {
   *          "wallet": "coinbase",
   *          "amount": 1
   *        },
   *        {
   *          "wallet": "coinbase",
   *          "amount": 1
   *        }
   *      ],
   *      "credit": [
   *        {
   *          "wallet": "miner2-wallet-address",
   *          "amount": 2
   *        },
   *        {
   *          "wallet": "miner2-wallet-address",
   *          "amount": 2
   *        }
   *      ]
   *    },
   *    "pending": {
   *      "amount": 0,
   *      "debet": [],
   *      "credit": []
   *    }
   *  }   */
  app.get(['/balance', '/balance/:address'], async (req, res) => {
    const result = await blockchainService.balance(req.params.address);
    res.json(result);
  });

  /**
   * @api {post} /mine Tell node to mine new block
   * @apiName Mining
   * @apiGroup Default
   *
   * @apiSuccessExample Response
   *  HTTP/1.1 200 OK
   *  {}
   *  }   */
  app.post('/mine', async (req, res) => {
    const result = await blockchainService.mine(req.body);
    socket.emit('block', { minerId });
    res.json(result);
  });

  /**
   * @api {post} /transaction Put new transaction to node queue
   * @apiName New transaction
   * @apiGroup Default
   *
   * @apiParamExample {json} Request-Example:
   *  {
   *    "input": "input-wallet-address",
   *    "output": "output-wallet-address",
   *    "amount": 1
   *  }
   *
   * @apiSuccess {Object} transaction  Just added transaction.
   *
   * @apiSuccessExample Response
   *  HTTP/1.1 200 OK
   *  [
   *    {
   *      "input": "input-wallet-address",
   *      "output": "output-wallet-address",
   *      "amount": 1
   *    }
   *  ]   */
  app.post('/transaction', async (req, res) =>
    res.json(blockchainService.transactionAdd(req.body)));

  /**
   * @api {get} /transactions Get allpending transactions on current node
   * @apiName Transactions list
   * @apiGroup Default
   *
   * @apiSuccess {Array} object  List of pending transactions on current node.
   *
   * @apiSuccessExample Response
   *  HTTP/1.1 200 OK
   *  [
   *    {
   *      "input": "input-wallet-address",
   *      "output": "output-wallet-address",
   *      "amount": 1
   *    }
   *  ]   */
  app.get('/transactions', async (req, res) =>
    res.json(blockchainService.transactionsList(req.body)));

  app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    error('server error', err);
    res.send(err.message || err);
  });

  app.listen(config.server.port, () => {
    log(`${config.app.name} v${config.app.version} started`);
    log(`waiting connections on http://${config.server.address}:${config.server.port}`);
  });

  socket.on('connect', () => {
    log('Connected successfully to pool');
  });

  socket.on('miners', async () => {
    const miners = await request({
      uri: config.miner.pool,
      json: true,
    });
    log('We ask miners list', miners);
    minersPool = miners.filter(({ id }) => id !== minerId);
    if (minersPool.length) {
      await blockchainService.syncronizeChain(minersPool);
    }
  });

  socket.on('block', async (data) => {
    log('Someone create new block. Need to update chain', JSON.stringify(data));
    if (minersPool.length) {
      await blockchainService.syncronizeChain(minersPool);
    }
  });

  socket.on('disconnect', () => {
    log('Connected successfully to pool');
  });

  socket.emit('hello', {
    id: minerId,
    address: config.server.externalUrl,
  });
});
