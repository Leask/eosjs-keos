'use strict';

const throwError = (message, status, options = {}) => {
    throw Object.assign(new Error(message), { status }, options);
};

const assert = (value, message, status, options) => {
    return value || throwError(message, status, options);
};

const rawEnsureString = (str) => {
    return String(str || '');
};

const ensureString = (str, options) => {
    options = options || {};
    str = rawEnsureString(str);
    if (options.case) {
        switch (rawEnsureString(options.case).trim()) {
            case 'UP':
                str = str.toUpperCase();
                break;
            case 'LOW':
                str = str.toLowerCase();
                break;
            default:
                throwError(`Invalid case option: '${options.case}'.`, 500);
        }
    }
    return str;
};

const trim = (str, options) => {
    return ensureString(str, options).trim();
};

// algorithm = 'sha1', 'md5', 'sha256', 'sha512'...
const hash = (string, algorithm = 'sha256') => {
    return crypto.createHash(algorithm).update(string).digest('hex');
};

const sha256 = (string) => {
    return hash(string);
};

module.exports = {
    assert,
    ensureString,
    throwError,
    trim,
    hash,
    sha256,
};

const crypto = require('crypto');
