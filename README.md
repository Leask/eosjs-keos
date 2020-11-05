# eosjs-keos

JavaScript API for using [keos](https://developers.eos.io/manuals/eos/v2.0/keosd/index) as `Signature Provider` to replace the `JsSignatureProvider`.

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

## Advance Options

### skipUnlock

`skipUnlock: false` by default. You can enable this option `skipUnlock: true` to turn off the auto-unlock feature for extreme security. The Signature Provider can be run `WITHOUT` any `password` or `key` configurations. You have to lock/unlock the wallet all by yourself.

### checkBeforeUnlock

`checkBeforeUnlock: false` by default. This means the Signature Provider will try to unlock the wallet whenever needed. It's fast and stable but will case annoying logs in the `keosd` console.

Example:

```console
thread-0  http_plugin.cpp:932  handle_exception  ] FC Exception encountered while processing wallet.unlock
```

Set `checkBeforeUnlock: true` to will force The Signature Provider to query and determine if the wallet needs to be unlocked, before actually unlock runs. It's a little bit slower but you can get a cleaner keosd console. It might cause issues when the wallet-unlock timeouts after check-action and before sign-action.

## Complete Implementation of keos APIs

```js
const KEOS = require('eosjs-keos');
const keos = new KEOS({ /* options */ });
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
const chain = new CHAIN({ /* options */ });
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
