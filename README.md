# jscoin

Full node. Registering self in pool manager and listed requests for add new transactions and mine new blocks. Send current blockchain by request, can calculate balance and statement for wallet address. Can work as independent miner without pool or can sync self blochain with other miniers nodes through miners pool manager (https://github.com/dpanchenko/jscoinMinerPool). Detailed API can be accessed by the root path: `http(a)://node-web-url/`

## Environment

`Node >= 8.11.2`

```
export DEBUG=jscoin*                              # debug information in console
export PORT=8080                                  # application server port
export MINER_OUTPUT='miner-wallet-address'        # wallet address for minig rewards
export LOKI_DB_PATH='db.json'                     # path to blockchain database file
export COMPLEXITY=1                               # POW complexity (count of zeroes from the beginning of hash)
export POOL_ADDRESS=http://localhost:8070         # http address of the jscoin-miner-pool(https://github.com/dpanchenko/jscoinMinerPool) application to sync all miners nodes for syncronize blockcain between minirs
export SERVER_EXTERNAL_URL=http://localhost:8080  # external address of current node (this address will receive all others nodes and will ask blocks for sync)
```

## Start

 - Clone or download this repository
``` bash
git clone
```

 - Enter your local directory, and install dependencies:

``` bash
npm i
```

## Commands

``` bash
# run server in development mode
npm run dev
```

``` bash
# build documentation
npm run doc
```

``` bash
# run linter
npm run lint
```

``` bash
# run tests
npm test
```

## Docker

 - For start application inside docker container use command
``` bash
# for correct access to host machine address we need to use or external links or docker defined host machine address, which is system dependent (on macos for latest docker versions it is docker.for.mac.localhost)
docker run -d --name=jscoin-miner \
  -p 8185:8080 \
  -v /home/data:/data \
  -e DEBUG="jscoin*" \
  -e MINER_OUTPUT="miner-wallet-address" \
  -e LOKI_DB_PATH="/data/db.json" \
  -e COMPLEXITY=1 \
  -e POOL_ADDRESS="http://docker.for.mac.localhost:8285" \        # instead `docker.for.mac.localhost` use you system defined constant or use external url (ngrok like tool)
  -e SERVER_EXTERNAL_URL="http://docker.for.mac.localhost:8185" \ # instead `docker.for.mac.localhost` use you system defined constant or use external url (ngrok like tool)
  --restart=always dpanchenko/jscoin-miner:latest
```


