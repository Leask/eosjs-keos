# eosjs-keos

JavaScript API for using `keos` as `Signature Provider` to replace the `JsSignatureProvider`.

## Install

```console
$ npm install eosjs-keos
```

## Import

The official distribution package can be found at [npm](https://www.npmjs.com/package/eosjs-keos).

```js
const { Api, JsonRpc, RpcError } = require('eosjs');
const { KeosSignatureProvider } = require('eosjs-keos/sig');
const fetch = require('node-fetch');                         // node only; not needed in browsers
const { TextEncoder, TextDecoder } = require('util');        // node only; native TextEncoder/Decoder
```

## Basic Usage

The Signature Provider `HOLDS` the `wallet password` to unlock the wallet to signing transactions.

The Signature Provider `DOES NOT HOLD` any `private keys` directly.

```js
const options = {
    keosApi: 'http://127.0.0.1:8900',
    wallet: 'keosjs_test',
    password: 'PWXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
};
const signatureProvider = new KeosSignatureProvider(options);
```

It should be a drop in replacement. After these config, you can use native [eosjs APIs](https://eosio.github.io/eosjs) smoothly. The `Signature Provider` will do the rest under the hood. More details can be found [here](https://github.com/EOSIO/eosjs).

## Complete Implementation of keos APIs

```js
const KEOS = require('eosjs-keos');
const keos = new KEOS({ /* options */});
```

API available:

* getRpcUrl: AsyncFunction
* rpcRequest: AsyncFunction
* getSupportedApis: AsyncFunction
* createWallet: AsyncFunction
* listWallet: AsyncFunction
* unlock: AsyncFunction
* lock: AsyncFunction
* lockAll: AsyncFunction
* createKey: AsyncFunction
* getPublicKeys: AsyncFunction
* importKey: AsyncFunction
* stop: AsyncFunction
* openWallet: AsyncFunction
* listKeys: AsyncFunction
* removeKey: AsyncFunction
* setTimeout: AsyncFunction
* signDigest: AsyncFunction
* signTransaction: AsyncFunction

## Required chain access APIs

```js
const CHAIN = require('eosjs-keos/chain');
const chain = new CHAIN({ /* options */});
```

API available:

* getRpcUrl: AsyncFunction
* rpcRequest: AsyncFunction
* makeActions: Function
* getExpiration: Function
* makeTransaction: AsyncFunction
* getInfo: AsyncFunction
* getAbiByAccountName: AsyncFunction
* abiJsonToBin: AsyncFunction
* getAbiBin: AsyncFunction
* makeAbiActions: AsyncFunction
* getRequiredKeys: AsyncFunction
* getBlock: AsyncFunction
* pushTransaction: AsyncFunction

## Test

```console
$ npm test
```
