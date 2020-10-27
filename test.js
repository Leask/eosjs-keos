'use strict';

const chain = require('./chain');
const KEOS = require('./');
const options = {
    keosApi: 'http://127.0.0.1:8900',
    wallet: 'keosjs_test',
};
const testDigest = '2244cfe582117b6b7fcffd6cbc218e51b763594092c23dd21ef1e1d15885b515';
const testPublicKey = 'EOS7PQwvSQUfzZ6CyeT3n2cX9kHpgWgppn5bD4gcDBvMj4WR9eTjh';
const testPrivateKey = '5KfHrpdGVFTEqnpdrqd2oGs1EtKcZDM23RJWdcF67nkSu8sXLhP';
const results = {};
const errors = [];
const getPasswordOptions = () => { return { password: results['createWallet'].password }; };
const split = () => { console.log(s); };

let keos = new KEOS(options);
let s = '\n===================================================================';
let successTest = 0;
let failedTest = 0;
let skippedTest = 0;
let prodPrivateKey = null;

try { prodPrivateKey = require('eosjs-keos/config').privateKey; } catch (err) { }

const signTransaction = async () => {
    const account = 'prs.prsc';
    const action = 'save';
    const actor = account;
    const args = {
        caller: actor,
        id: 'test_id',
        user_address: 'test_user_address',
        type: 'test_type',
        meta: 'test_meta',
        data: 'test_data',
        hash: 'test_hash',
        signature: 'test_signature',
    };
    await keos.importKey(prodPrivateKey, getPasswordOptions());
    const availableKeys = await keos.getPublicKeys(getPasswordOptions());
    const actions = await chain.makeAbiActions(account, action, actor, args);
    const requiredKeys = await chain.getRequiredKeys(availableKeys, actions);
    const chainInfo = await chain.getInfo();
    const transaction = await chain.makeTransaction(actions, null, chainInfo.last_irreversible_block_num);
    const sig = await keos.signTransaction(transaction, requiredKeys, chainInfo.chain_id);
    return await chain.pushTransaction(transaction, sig.signatures);
};

const tests = {
    getRpcUrl: {},
    getSupportedApis: {},
    createWallet: {},
    listWallet: {},
    openWallet: { args: [options.wallet] },
    lock: {},
    lockAll: {},
    unlock: { pre: () => { return [getPasswordOptions()] } },
    createKey: { pre: () => { return [getPasswordOptions()] } },
    getPublicKeys: { pre: () => { return [getPasswordOptions()] } },
    importKey: { pre: () => { return [testPrivateKey, getPasswordOptions()] } },
    listKeys: { pre: () => { return [getPasswordOptions()] } },
    removeKey: { pre: () => { return [results['createKey'].publicKey, getPasswordOptions()] } },
    setTimeout: { args: [120] },
    rpcRequest: { args: ['POST', 'sign_digest', [testDigest, testPublicKey]] },
    signDigest: { pre: () => { return [testDigest, testPublicKey, getPasswordOptions()] } },
    signTransaction: { skip: !prodPrivateKey, overload: signTransaction },
    stop: { skip: true },
};

const test = async (func) => {
    if (tests[func].skip) { skippedTest++; return; };
    let args = [];
    try {
        args = (tests[func].pre ? await tests[func].pre() : null)
            || tests[func].args || [];
    } catch (err) { console.log(err); }
    try {
        console.log(`\n>>> TEST ${successTest + failedTest + 1}`
            + ` :::::::::: keos.${func}(`
            + args.map(x => JSON.stringify(x)).join(', ') + ')');
        results[func] = await (tests[func].overload
            || keos[func]).apply(null, args);
        // console.log(`Success: ${JSON.stringify(results[func], null, 2)}`);
        console.log(`Success: ${JSON.stringify(results[func])}`);
        successTest++;
    } catch (err) {
        errors.push(`Failed: ${err.message}`);
        console.log(errors[errors.length - 1]);
        failedTest++;
    }
};

(async () => {

    const start = process.hrtime();
    split(); for (let func in tests) { await test(func); }
    const duration = Math.round(process.hrtime(start)[1] / 1000000 / 10) / 100;
    split(); console.log(`\nSuccess: ${successTest}, Failed: ${failedTest}, `
        + `Skipped: ${skippedTest}, Time consuming: ${duration} seconds.`)
    split();

    if (errors.length) {
        throw Object.assign(new Error(`${failedTest} test failed.`),
            { details: errors });
    }

})();
