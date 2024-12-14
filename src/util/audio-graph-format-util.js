"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listString = listString;
exports.toOrdinalNumbers = toOrdinalNumbers;
exports.toHashedObject = toHashedObject;
exports.bufferToArrayBuffer = bufferToArrayBuffer;
const audio_graph_util_1 = require("./audio-graph-util");
function listString(arr, delim, isAnd, _and) {
    if (arr.length == 0)
        return "";
    else if (arr.length == 1)
        return arr[0];
    else if (arr.length == 2 && isAnd)
        return `${arr[0]} ${_and || 'and'} ${arr[1]}`;
    else if (arr.length == 2 && !isAnd)
        return `${arr[0]}${delim || ' '}${arr[1]} `;
    else if (!isAnd) {
        return arr.join(delim);
    }
    else {
        let last = arr[arr.length - 1];
        let rest = arr.slice(0, arr.length - 1);
        let space_before_and = delim.endsWith(' ');
        return rest.join(delim) + delim + `${space_before_and ? '' : ' '}${(_and === null || _and === void 0 ? void 0 : _and.trim()) || 'and'} ` + last;
    }
}
function toOrdinalNumbers(n) {
    // upto 23
    return ["zeroth", "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "nineth",
        "tenth", "eleventh", "twelveth", "thirteenth", "fourteenth", "fifteenth", "sixteenth", "seventeenth", "eighteenth", "nineteenth",
        "twentieth", "twenty-first", "twenty-second", "twenty-third"][n] || n + "th";
}
/**
 * convert an array of objects to an dict-like object of objects
 * @param a
 * @param k
 * @param dp
 * @returns
 */
function toHashedObject(a, k, dp) {
    let o = {};
    a.forEach((d) => {
        let key = d[k];
        if (dp) {
            o[key] = (0, audio_graph_util_1.deepcopy)(d);
        }
        else {
            o[key] = d;
        }
    });
    return o;
}
function bufferToArrayBuffer(x) {
    let arrayBuffer = new ArrayBuffer(x.length);
    let arr = new Uint8Array(arrayBuffer);
    for (let i = 0; i < x.length; ++i) {
        arr[i] = x[i];
    }
    return arrayBuffer;
}
