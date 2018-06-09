# jscoin

## Environment

`Node >= 8.11.2`

```
export DEBUG=jscoin*                              # debug information in console
export PORT=8080                                  # application server port
export MINER_OUTPUT='miner-wallet-address'        # wallet address for minig rewards
export LOKI_DB_PATH='db.json'                     # path to blockchain database file
export COMPLEXITY=1                               # POW complexity (count of zeroes from the beginning of hash)
export POOL_ADDRESS=http://localhost:8070         # http address of hte pool to sync all miners nodes for syncronize blockcain between minirs
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
docker run -d --name=jscoin-miner \
  -p 8185:8080 \
  -v /home/data:/data \
  -e DEBUG="jscoin*" \
  -e MINER_OUTPUT="miner-wallet-address" \
  -e LOKI_DB_PATH="/data/db.json" \
  -e COMPLEXITY=1 \
  -e POOL_ADDRESS="http://localhost:8070" \
  -e SERVER_EXTERNAL_URL="http://localhost:8185" \
  --restart=always dpanchenko/jscoinminer:latest
```


