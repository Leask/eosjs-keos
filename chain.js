'use strict';

const defaultChainApi = 'http://149.56.70.124:8888';
const defaultHeaders = { 'Content-Type': 'application/json' };

const constructor = (() => {

    let [api] = [defaultChainApi];

    const chain = function(options) {
        options = options || {};
        api = options.chainApi || api;
        return chain;
    };

    chain.getRpcUrl = async (path, opts) => {
        opts = opts || {};
        return `${api}${path ? `${opts.apiRoot || '/v1/chain/'}${path}` : ''}`;
    };

    chain.rpcRequest = async (method, api, body, options) => {
        options = options || {};
        const resp = await fetch(await chain.getRpcUrl(api, options), {
            method: method = utilitas.trim(method, { case: 'UP' }),
            body: method === 'GET' ? null : JSON.stringify(body || {}),
            headers: defaultHeaders, ...options
        }).then(x => x.json());
        if (!resp || resp.error) {
            const err = resp && resp.error || {};
            const msg = err.what || err.name || 'Error querying chain RPC api.';
            const extension = {};
            Object.assign(extension, err.code ? { code: err.code } : {
            }, err.details ? {
                [options.throwDetails ? 'details' : 'internal']: err.details
            } : {});
            utilitas.throwError(msg, resp.code || 500, extension);
        }
        return resp;
    };

    chain.makeActions = (account, actor, name, data, permission = 'active') => {
        return {
            actions: [{
                account, name, authorization: [{ actor, permission, }], data,
            }],
        };
    };

    chain.getExpiration = () => {
        return new Date(new Date().getTime(
        ) + 1000 * 60 * 10).toISOString().replace(/Z$/, '');
    };

    chain.makeTransaction = async (actions, lastBlock, lastIrvsbleBlockNum) => {
        if (!lastBlock && lastIrvsbleBlockNum) {
            lastBlock = await chain.getBlock(lastIrvsbleBlockNum);
        }
        return Object.assign({}, actions, {
            ref_block_num: lastBlock.block_num,
            ref_block_prefix: lastBlock.ref_block_prefix,
            expiration: chain.getExpiration(),
            signatures: [],
            context_free_actions: [],
            transaction_extensions: [],
        });
    };

    chain.getInfo = async () => {
        const resp = await chain.rpcRequest('GET', 'get_info');
        utilitas.assert(resp && resp.last_irreversible_block_num
            && resp.chain_id, 'Error fetching chain info.', 500);
        return resp;
    };

    chain.getAbiByAccountName = async (account_name, action) => {
        utilitas.assert(account_name, 'Invalid abi account name.', 400);
        const data = { account_name };
        const resp = await chain.rpcRequest('POST', 'get_abi', data);
        utilitas.assert(resp && resp.abi, 'Error querying abi.', 500);
        if (!action) { return resp.abi; }
        let result = null;
        for (let struct of resp.abi.structs) {
            if (struct.name === action) {
                result = struct.fields.map(x => x.name); break;
            }
        }
        utilitas.assert(result, 'Abi not found.', 500);
        return result;
    };

    chain.abiJsonToBin = async (account, action, arrArgs) => {
        utilitas.assert(account, 'Invalid abi account.', 400);
        utilitas.assert(action, 'Invalid abi action.', 400);
        utilitas.assert(arrArgs, 'Invalid abi args.', 400);
        const data = { code: account, action, args: arrArgs };
        const resp = await chain.rpcRequest('POST', 'abi_json_to_bin', data);
        utilitas.assert(resp && resp.binargs,
            'Error transferring json to bin.', 500);
        return resp.binargs;
    };

    chain.getAbiBin = async (account, action, args) => {
        const arrArgs = [];
        (await chain.getAbiByAccountName(account, action)).map(x => {
            if (typeof args[x] === 'undefined') {
                utilitas.throwError(`${x} is required.`);
            } else {
                arrArgs.push(args[x]);
            }
        });
        return await chain.abiJsonToBin(account, action, arrArgs);
    };

    chain.makeAbiActions = async (account, action, actor, args, permission) => {
        const abiBin = await chain.getAbiBin(account, action, args);
        return chain.makeActions(account, actor, action, abiBin, permission);
    };

    chain.getRequiredKeys = async (available_keys, transaction) => {
        utilitas.assert(available_keys, 'Invalid available keys.', 400);
        utilitas.assert(transaction, 'Invalid transaction.', 400);
        const data = { available_keys, transaction };
        const resp = await chain.rpcRequest('POST', 'get_required_keys', data);
        utilitas.assert(resp && resp.required_keys && resp.required_keys.length,
            'Error transferring json to bin.', 500);
        return resp.required_keys;
    };

    chain.getBlock = async (block_num_or_id) => {
        utilitas.assert(block_num_or_id, 'Invalid block num or id.', 400);
        const data = { block_num_or_id };
        const resp = await chain.rpcRequest('POST', 'get_block', data);
        utilitas.assert(resp && resp.ref_block_prefix,
            'Error fetching block info.', 500);
        return resp;
    };

    chain.pushTransaction = async (transaction, signatures) => {
        utilitas.assert(transaction, 'Action is required.', 400);
        utilitas.assert(signatures, 'Signatures is required.', 400);
        const date = { compression: 'none', signatures, transaction };
        const resp = await chain.rpcRequest('POST', 'push_transaction', date);
        utilitas.assert(resp && resp.transaction_id,
            'Error pushing action.', 500);
        return resp;
    };

    return chain;

})();

module.exports = constructor;

const utilitas = require('./lib/utilitas');
const fetch = require('node-fetch');
