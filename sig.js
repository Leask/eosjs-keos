'use strict';

let KeosSignatureProvider = (function() {

    function KeosSignatureProvider(options) {
        options = options || {};
        this.wallet = options.wallet || null;
        this.password = options.password;
        this.keos = new keos(Object.assign({
        }, options.keosApi ? { keosApi: options.keosApi } : {}));
    }

    KeosSignatureProvider.prototype.getAvailableKeys = async function() {
        return await this.keos.getPublicKeys(this.wallet, this.password);
    };

    KeosSignatureProvider.prototype.sign = async function(cur) {
        const digest = utilitas.sha256(Buffer.concat([
            Buffer(cur.chainId, 'hex'),
            Buffer(cur.serializedTransaction),
            Buffer(new Uint8Array(32)),
        ]));
        const signatures = [];
        for (let pubKey of cur.requiredKeys) {
            const signature = await this.keos.signDigest(
                this.wallet, this.password, digest, pubKey
            );
            signatures.push(signature);
        };
        return { signatures, serializedTransaction: cur.serializedTransaction };
    };

    return KeosSignatureProvider;

}());

exports.KeosSignatureProvider = KeosSignatureProvider;

const utilitas = require('./lib/utilitas');
const keos = require('./');
