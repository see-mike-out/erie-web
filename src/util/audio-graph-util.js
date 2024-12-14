"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unique = unique;
exports.deepcopy = deepcopy;
exports.aRange = aRange;
exports.round = round;
exports.floor = floor;
exports.genRid = genRid;
exports.getFirstDefined = getFirstDefined;
exports.asc = asc;
exports.desc = desc;
function unique(arr) {
    return Array.from(new Set(arr));
}
function deepcopy(i) {
    return JSON.parse(JSON.stringify(i));
}
function aRange(s, e, incl) {
    let o = [];
    if (incl)
        e = e + 1;
    for (let i = s; i < e; i++) {
        o.push(i);
    }
    return o;
}
function round(n, d) {
    let e = Math.pow(10, -d);
    return Math.round(n * e) / e;
}
function floor(n, d) {
    let e = Math.pow(10, -d);
    return Math.floor(n * e) / e;
}
const RidLetters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
const NRidLetters = RidLetters.length - 1;
function genRid(n) {
    if (!n)
        n = 6;
    let rid = [];
    for (let i = 0; i < n; i++) {
        let k = Math.round(Math.random() * NRidLetters);
        rid.push(RidLetters[k]);
    }
    return rid.join('');
}
function getFirstDefined(...args) {
    for (const arg of args) {
        if (arg !== undefined)
            return arg;
    }
    return args[args.length - 1];
}
function asc(a, b) {
    if (typeof a === 'number' && typeof b === 'number')
        return a - b;
    else if ((a === null || a === void 0 ? void 0 : a.constructor.name) === Date.name && (b === null || b === void 0 ? void 0 : b.constructor.name) === Date.name)
        return a - b;
    else if (a === null || a === void 0 ? void 0 : a.localeCompare)
        return a.localeCompare(b);
    else
        return a > b ? 1 : a < b ? -1 : 0;
}
function desc(a, b) {
    if (typeof a === 'number' && typeof b === 'number')
        return b - a;
    else if ((a === null || a === void 0 ? void 0 : a.constructor.name) === Date.name && (b === null || b === void 0 ? void 0 : b.constructor.name) === Date.name)
        return b - a;
    else if (b === null || b === void 0 ? void 0 : b.localeCompare)
        return b.localeCompare(a);
    else
        return a < b ? 1 : a > b ? -1 : 0;
}
