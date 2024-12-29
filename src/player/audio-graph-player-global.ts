import {
  SpeechType,
  ToneType,
  GlobalControl,
  GlobalState
} from "../types";

export function setCurrentTime(ctx: AudioContext | OfflineAudioContext) {
  return ctx.currentTime;
}

declare global {
  interface Window {
    ErieGlobalControl?: GlobalControl;
    ErieGlobalState?: GlobalState;
  }
}

export let ErieGlobalControl: GlobalControl, ErieGlobalState: GlobalState;

export function setErieGlobalControl(ctrl: GlobalControl) {
  if (!('ErieGlobalControl' in window)) window.ErieGlobalControl = undefined;
  ErieGlobalControl = ctrl;
}

export function isErieGlobalControlType(t: typeof SpeechType | typeof ToneType) {
  return window.ErieGlobalControl?.type === t;
}

export function setErieGlobalState(state: GlobalState) {
  if (!('ErieGlobalState' in window)) window.ErieGlobalState = undefined;
  ErieGlobalState = state;
}

export function isErieGlobalState(state: any) {
  return window.ErieGlobalState === state;
}
