import { Globals } from "../base";
import {
  SpeechType,
  ToneType,
  GlobalControl,
  GlobalState,
  ConfigInterface,
  Stopped,
  GlobalStreamingControl
} from "../types";
import {
  isBrowserWindowPossible,
  notifyStop
} from "../util";
import { AudioGraphQueue } from "./audio-graph-player";

export function setCurrentTime(ctx: AudioContext | OfflineAudioContext) {
  return ctx.currentTime;
}

declare global {
  interface Window {
    ErieGlobalStreamingControl: GlobalStreamingControl;
    ErieGlobalControl?: GlobalControl;
    ErieGlobalState?: GlobalState;
    ErieGlobalPlayerEvents?: Map<string, (e: KeyboardEvent) => void>;
  }
}


// export let ErieGlobalControl: GlobalControl, ErieGlobalState: GlobalState;

export function setErieGlobalControl(ctrl: GlobalControl | undefined) {
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

export function isErieGlobalControlAudioContext() {
  if (isBrowserWindowPossible()) {
    return (window.ErieGlobalControl?.player instanceof AudioContext) || (window.ErieGlobalControl?.player instanceof OfflineAudioContext);
  } else {
    return (Globals.ErieGlobalControl?.player instanceof AudioContext) || (Globals.ErieGlobalControl?.player instanceof OfflineAudioContext);
  }
}

export function isErieGlobalControlSpeechSynthesis() {
  if (isBrowserWindowPossible()) {
    return (window.ErieGlobalControl?.player instanceof SpeechSynthesis);
  } else {
    return (Globals.ErieGlobalControl?.player instanceof SpeechSynthesis);
  }
}

export function closeErieGlobalControl() {
  if (isBrowserWindowPossible()) {
    if (window.ErieGlobalControl?.player && 'cancel' in window.ErieGlobalControl?.player) {
      window.ErieGlobalControl?.player.cancel();
    } else if (window.ErieGlobalControl?.player && 'close' in window.ErieGlobalControl?.player) {
      window.ErieGlobalControl?.player.close();
    }
  } else {
    if (Globals.ErieGlobalControl?.player && 'cancel' in Globals.ErieGlobalControl?.player) {
      Globals.ErieGlobalControl?.player.cancel();
    } else if (Globals.ErieGlobalControl?.player && 'close' in Globals.ErieGlobalControl?.player) {
      Globals.ErieGlobalControl?.player.close();
    }
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

export function setPlayerEvents(queue: AudioGraphQueue, config: ConfigInterface) {
  if (typeof window !== 'undefined') {
    const stop = function (event: KeyboardEvent) {
      if ('key' in event && event.key == 'x') {
        setErieGlobalState(Stopped);
        queue.state = Stopped;
        closeErieGlobalControl();
        notifyStop(config);
      }
    }
    if (isBrowserWindowPossible()) {
      window.addEventListener('keypress', stop);
      if (!window.ErieGlobalPlayerEvents) window.ErieGlobalPlayerEvents = new Map();
      window.ErieGlobalPlayerEvents.set('stop-event', stop);
    } else {
      Globals.ErieGlobalPlayerEvents.set('stop-event', stop);
    }
  }
}

export function clearPlayerEvents() {
  if (typeof window !== 'undefined') {

    if (isBrowserWindowPossible()) {
      if (!window.ErieGlobalPlayerEvents) window.ErieGlobalPlayerEvents = new Map();
      let stop = window.ErieGlobalPlayerEvents.get('stop-event');
      if (stop) window.removeEventListener('keypress', stop);
      window.ErieGlobalPlayerEvents.delete('stop-event');
    } else {
      Globals.ErieGlobalPlayerEvents.delete('stop-event');
    }
  }
}


export function setErieGlobalStreamingControl(key: keyof GlobalStreamingControl, value: any) {
  if (isBrowserWindowPossible()) {
    // @ts-ignore
    if (!('ErieGlobalStreamingControl' in window)) window.ErieGlobalStreamingControl = {} as GlobalStreamingControl;
    window.ErieGlobalStreamingControl[key] = value;
  } else {
    Globals.ErieGlobalStreamingControl[key] = value;
  }
}

