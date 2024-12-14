"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBrowserEventPossible = isBrowserEventPossible;
exports.isBrowserWindowPossible = isBrowserWindowPossible;
function isBrowserEventPossible() {
    var _a;
    return typeof document === 'object' && ((_a = document === null || document === void 0 ? void 0 : document.body) === null || _a === void 0 ? void 0 : _a.dispatchEvent);
}
function isBrowserWindowPossible() {
    return typeof window === 'object';
}
