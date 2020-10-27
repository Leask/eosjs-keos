'use strict';

const defaultWallet = 'default';
const defaultKeosApi = 'http://127.0.0.1:8900';
const defaultHeaders = { 'Content-Type': 'application/json' };
const keyTypeK1 = 'K1';
const keyTypeR1 = 'R1';
const keyTypes = [keyTypeK1, keyTypeR1];

const constructor = (() => {

    let [api, wallet, password] = [defaultKeosApi, defaultWallet, null];

    const keos = function(options) {
        options = options || {};
        api = options.keosApi || api;
        wallet = options.wallet || wallet;
        password = options.password || password;
        return keos;
    };

    keos.getRpcUrl = async (path, opts) => {
        opts = opts || {};
        return `${api}${path ? `${opts.apiRoot || '/v1/wallet/'}${path}` : ''}`;
    };

    keos.rpcRequest = async (method, api, body, options) => {
        options = options || {};
        const resp = await fetch(await keos.getRpcUrl(api, options), {
            method: method = utilitas.trim(method, { case: 'UP' }),
            body: method === 'GET' ? null : JSON.stringify(body || {}),
            headers: defaultHeaders, ...options
        }).then(x => x.json());
        if (!resp || resp.error) {
            const err = resp && resp.error || {};
            const msg = err.what || err.name || 'Error querying keos RPC api.';
            const extension = {};
            Object.assign(extension, err.code ? { code: err.code } : {
            }, err.details ? {
                [options.throwDetails ? 'details' : 'internal']: err.details
            } : {});
            utilitas.throwError(msg, resp.code || 500, extension);
        }
        return resp;
    };

    keos.assertWalletName = (walletName) => {
        walletName = utilitas.trim(walletName || wallet);
        utilitas.assert(walletName, 'Invalid wallet name.', 400);
        return walletName;
    };

    keos.assertPassword = (passwd) => {
        passwd = passwd || password;
        utilitas.assert(passwd, `Password is required.`, 400);
        return passwd;
    };

    keos.assertPublicKey = (publicKey) => {
        utilitas.assert(publicKey, `Public key is required.`, 400);
    };

    keos.getSupportedApis = async () => {
        const opt = { apiRoot: '/v1/node/' };
        const r = await keos.rpcRequest('GET', 'get_supported_apis', null, opt);
        return r.apis;
    };

    keos.createWallet = async (walletName) => {
        walletName = keos.assertWalletName(walletName);
        const password = await keos.rpcRequest('POST', 'create', walletName);
        return { wallet: walletName, password };
    };

    keos.listWallet = async () => {
        return await keos.rpcRequest('GET', 'list_wallets');
    };

    keos.unlock = async (options) => {
        options = options || {};
        const wallet = keos.assertWalletName(options.wallet);
        if (options.skipUnlock) { return { wallet }; }
        const paswd = keos.assertPassword(options.password);
        let result = {};
        try {
            result = await keos.rpcRequest('POST', 'unlock', [wallet, paswd]);
        } catch (er) { utilitas.assert(er.code === 3120007, er.message, 400); }
        return { wallet, password: options.getPassword ? paswd : null, result };
    };

    keos.lock = async (walletName) => {
        walletName = keos.assertWalletName(walletName);
        return await keos.rpcRequest('POST', 'lock', walletName);
    };

    keos.lockAll = async () => {
        return await keos.rpcRequest('POST', 'lock_all');
    };

    keos.createKey = async (options) => {
        options = options || {};
        const type = options.keyType || keyTypeK1;
        utilitas.assert(keyTypes.includes(type), `Invalid type: ${type}.`, 400);
        const data = [(await keos.unlock(options)).wallet, type];
        return { publicKey: await keos.rpcRequest('POST', 'create_key', data) };
    };

    keos.getPublicKeys = async (options) => {
        await keos.unlock(options);
        return await keos.rpcRequest('GET', 'get_public_keys');
    };

    keos.importKey = async (privateKey, options) => {
        utilitas.assert(privateKey, `Private key is required.`, 400);
        const data = [(await keos.unlock(options)).wallet, privateKey]
        return await keos.rpcRequest('POST', 'import_key', data);
    };

    keos.stop = async () => {
        const opts = { apiRoot: '/v1/keosd/' };
        return await keos.rpcRequest('POST', 'stop', null, opts);
    };

    keos.openWallet = async (walletName) => {
        walletName = keos.assertWalletName(walletName);
        return await keos.rpcRequest('POST', 'open', walletName);
    };

    keos.listKeys = async (options) => {
        const opts = Object.assign({ getPassword: true }, options);
        const { wallet, password } = await keos.unlock(opts);
        return await keos.rpcRequest('POST', 'list_keys', [wallet, password]);
    };

    keos.removeKey = async (publicKey, options) => {
        keos.assertPublicKey(publicKey);
        const opts = Object.assign({ getPassword: true }, options);
        const { wallet, password } = await keos.unlock(opts);
        const data = [wallet, password, publicKey];
        return await keos.rpcRequest('POST', 'remove_key', data);
    };

    keos.setTimeout = async (second) => {
        return await keos.rpcRequest('POST', 'set_timeout', ~~second || 60);
    };

    keos.signDigest = async (hash, publicKey, options) => {
        utilitas.assert(hash, 'Digest is required.', 400);
        keos.assertPublicKey(publicKey);
        await keos.unlock(options);
        return await keos.rpcRequest('POST', 'sign_digest', [hash, publicKey]);
    };

    keos.signTransaction = async (transaction, publicKey, chainId) => {
        utilitas.assert(transaction, 'Transaction is required.', 400);
        utilitas.assert(publicKey, 'Public key is required.', 400);
        utilitas.assert(chainId, 'Chain id is required.', 400);
        const data = [transaction, publicKey, chainId];
        return await keos.rpcRequest('POST', 'sign_transaction', data);
    };

    return keos;

})();

module.exports = constructor;

const utilitas = require('./lib/utilitas');
const fetch = require('node-fetch');
