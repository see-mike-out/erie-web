"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isJSON = isJSON;
exports.isTSV = isTSV;
exports.isCSV = isCSV;
exports.jType = jType;
exports.detectType = detectType;
const encoding_1 = require("../types/encoding");
function isJSON(d) {
    try {
        JSON.parse(d);
        return true;
    }
    catch (_a) {
        return false;
    }
}
const TSV_format = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^\t'"\s\\]*(?:\s+[^\t'"\s\\]+)*)\s*(?:\t\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^\t\'"\s\\]*(?:\s+[^\t'"\s\\]+)*)\s*)*$/gi;
function isTSV(d) {
    return d.match(TSV_format);
}
const CSV_format = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/gi;
function isCSV(d) {
    return d.match(CSV_format);
}
function jType(v) {
    return v === null || v === void 0 ? void 0 : v.constructor.name;
}
function detectType(values) {
    if (values.every((d) => (d === null || d === void 0 ? void 0 : d.constructor.name) === "Number"))
        return encoding_1.QUANT;
    else
        return encoding_1.ORD;
}
