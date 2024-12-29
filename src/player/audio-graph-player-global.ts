import {
  SpeechType,
  ToneType,
  GlobalControl,
  GlobalState
} from "../types";
import { isBrowserWindowPossible } from "../util";

export function setCurrentTime(ctx: AudioContext | OfflineAudioContext) {
  return ctx.currentTime;
}

declare global {
  interface Window {
    ErieGlobalControl?: GlobalControl;
    ErieGlobalState?: GlobalState;
  }
}

export const Globals: {
  ErieGlobalControl: GlobalControl | undefined,
  ErieGlobalState: GlobalState
} = {
  ErieGlobalControl: undefined,
  ErieGlobalState: undefined
}


// export let ErieGlobalControl: GlobalControl, ErieGlobalState: GlobalState;

export function setErieGlobalControl(ctrl: GlobalControl) {
  if (isBrowserWindowPossible()) {
    if (!('ErieGlobalControl' in window)) window.ErieGlobalControl = undefined;
    window.ErieGlobalControl = ctrl;
  } else {
    Globals.ErieGlobalControl = ctrl;
  }
}

export function isErieGlobalControlType(t: typeof SpeechType | typeof ToneType) {
  if (isBrowserWindowPossible()) {
    return window.ErieGlobalControl?.type === t;
  } else {
    return Globals.ErieGlobalControl?.type === t;
  }
}

export function setErieGlobalState(state: GlobalState) {
  if (isBrowserWindowPossible()) {
    if (!('ErieGlobalState' in window)) window.ErieGlobalState = undefined;
    window.ErieGlobalState = state;
  } else {
    Globals.ErieGlobalState = state;
  }
}

export function isErieGlobalState(state: any) {
  if (isBrowserWindowPossible()) {
    return window.ErieGlobalState === state;
  } else {
    return Globals.ErieGlobalState === state;
  }
}
