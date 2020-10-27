# eosjs-keos

JavaScript API for using `keos` as `Signature Provider` to replace the `JsSignatureProvider`, which lack safety design.

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

Specify api address, default:
const defaultWallet = 'default';
const defaultKeosApi = 'http://127.0.0.1:8900';

```js
const options = {

};
const signatureProvider = new KeosSignatureProvider({password});
```

The Signature Provider `holds the wallet password` to unlock the wallet to signing transactions.

The Signature Provider `does not hold` any private keys directly.

```js
const password = "PWXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
const signatureProvider = new KeosSignatureProvider({password});
```

For better security, you can lock/unlock the wallet all by your self outside Node.js.

You have to unlock the wallet before any sensitive wallet API is requested.

```js
const signatureProvider = new KeosSignatureProvider({skipUnlock: true});
```

It should be a drop in replacement. After these config, you can use native [eosjs APIs](https://eosio.github.io/eosjs) smoothly. The `Signature Provider` will do the rest under the hood. More details can be found [here](https://github.com/EOSIO/eosjs).

## Complete Implementation of keos APIs

```js
const keos = require('eosjs-keos');
await keos.createKey,
await keos.createWallet,
await keos.getPublicKeys,
await keos.getRpcUrl,
await keos.getSupportedApis,
await keos.importKey,
await keos.listWallet,
await keos.lock,
await keos.lockAll,
await keos.rpcRequest,
await keos.unlock,
await keos.stop,
await keos.openWallet,
await keos.listKeys,
await keos.removeKey,
await keos.setTimeout,
await keos.signDigest,
await keos.signTransaction,
```
