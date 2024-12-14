"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.playSystemSpeech = playSystemSpeech;
exports.notifyStop = notifyStop;
exports.notifyPause = notifyPause;
exports.notifyResume = notifyResume;
function playSystemSpeech(sound, config) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            var synth = window.speechSynthesis;
            var utterance = new SpeechSynthesisUtterance(sound.speech);
            if ((config === null || config === void 0 ? void 0 : config.speechRate) !== undefined)
                utterance.rate = config === null || config === void 0 ? void 0 : config.speechRate;
            else if ((sound === null || sound === void 0 ? void 0 : sound.speechRate) !== undefined)
                utterance.rate = sound === null || sound === void 0 ? void 0 : sound.speechRate;
            synth.speak(utterance);
            utterance.onend = () => {
                resolve();
            };
        });
    });
}
function notifyStop(config) {
    return __awaiter(this, void 0, void 0, function* () {
        yield playSystemSpeech({ speech: "Stopped.", speechRate: config === null || config === void 0 ? void 0 : config.speechRate });
        return;
    });
}
function notifyPause(config) {
    return __awaiter(this, void 0, void 0, function* () {
        yield playSystemSpeech({ speech: "Paused.", speechRate: config === null || config === void 0 ? void 0 : config.speechRate });
        return;
    });
}
function notifyResume(config) {
    return __awaiter(this, void 0, void 0, function* () {
        yield playSystemSpeech({ speech: "Resumeing", speechRate: config === null || config === void 0 ? void 0 : config.speechRate });
        return;
    });
}
