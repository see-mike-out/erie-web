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
    ErieGlobalStreamingControl: { [key: string]: GlobalStreamingControl };
    ErieGlobalControl?: { [key: string]: GlobalControl | undefined };
    ErieGlobalState?: { [key: string]: GlobalState };
    ErieGlobalPlayerEvents?: { [key: string]: Map<string, (e: KeyboardEvent) => void> };
  }
}


// export let ErieGlobalControl: GlobalControl, ErieGlobalState: GlobalState;

export function setErieGlobalControl(player_id: string, ctrl: GlobalControl | undefined) {
  if (isBrowserWindowPossible()) {
    if (!('ErieGlobalControl' in window)) window.ErieGlobalControl = {};
    if ('ErieGlobalControl' in window && window.ErieGlobalControl instanceof Object) {
      window.ErieGlobalControl[player_id] = ctrl;
    }
  } else {
    Globals.ErieGlobalControl[player_id] = ctrl;
  }
}

export function isErieGlobalControlType(player_id: string, t: typeof SpeechType | typeof ToneType) {
  if (isBrowserWindowPossible()) {
    return window.ErieGlobalControl?.[player_id]?.type === t;
  } else {
    return Globals.ErieGlobalControl?.[player_id]?.type === t;
  }
}

export function isErieGlobalControlAudioContext(player_id: string) {
  if (isBrowserWindowPossible()) {
    return (window.ErieGlobalControl?.[player_id]?.player instanceof AudioContext) || (window.ErieGlobalControl?.[player_id]?.player instanceof OfflineAudioContext);
  } else {
    return (Globals.ErieGlobalControl?.[player_id]?.player instanceof AudioContext) || (Globals.ErieGlobalControl?.[player_id]?.player instanceof OfflineAudioContext);
  }
}

export function isErieGlobalControlSpeechSynthesis(player_id: string) {
  if (isBrowserWindowPossible()) {
    return (window.ErieGlobalControl?.[player_id]?.player instanceof SpeechSynthesis);
  } else {
    return (Globals.ErieGlobalControl?.[player_id]?.player instanceof SpeechSynthesis);
  }
}

export function closeErieGlobalControl(player_id: string) {
  if (isBrowserWindowPossible()) {
    let global_player = window.ErieGlobalControl?.[player_id]?.player;
    if (global_player && 'cancel' in global_player) {
      global_player.cancel();
    } else if (global_player && 'close' in global_player) {
      global_player.close();
    }
  } else {
    let global_player = Globals.ErieGlobalControl?.[player_id]?.player;
    if (global_player && 'cancel' in global_player) {
      global_player.cancel();
    } else if (global_player && 'close' in global_player) {
      global_player.close();
    }
  }
}

export function setErieGlobalState(player_id: string, state: GlobalState) {
  if (isBrowserWindowPossible()) {
    if (!('ErieGlobalState' in window)) window.ErieGlobalState = {};
    if ('ErieGlobalState' in window && window.ErieGlobalState instanceof Object) {
      window.ErieGlobalState[player_id] = state;
    }
  } else {
    Globals.ErieGlobalState[player_id] = state;
  }
}

export function isErieGlobalState(player_id: string, state: any) {
  if (isBrowserWindowPossible()) {
    if (!('ErieGlobalState' in window)) window.ErieGlobalState = {};
    if ('ErieGlobalState' in window && window.ErieGlobalState instanceof Object) {
      return window.ErieGlobalState[player_id] === state;
    }
  } else {
    return Globals.ErieGlobalState[player_id] === state;
  }
}

export function setPlayerEvents(queue: AudioGraphQueue, config: ConfigInterface) {
  if (typeof window !== 'undefined') {
    const stop = function (event: KeyboardEvent) {
      if ('key' in event && event.key == 'x') {
        setErieGlobalState(queue.player_id, Stopped);
        queue.state = Stopped;
        closeErieGlobalControl(queue.player_id);
        notifyStop(config);
      }
    }
    if (isBrowserWindowPossible()) {
      window.addEventListener('keypress', stop);
      if (!window.ErieGlobalPlayerEvents) window.ErieGlobalPlayerEvents = { [queue.player_id]: new Map() }
      window.ErieGlobalPlayerEvents[queue.player_id].set('stop-event', stop);
    } else {
      Globals.ErieGlobalPlayerEvents[queue.player_id].set('stop-event', stop);
    }
  }
}

export function clearPlayerEvents(queue: AudioGraphQueue | string) {
  let player_id = queue instanceof AudioGraphQueue ? queue.player_id : queue;
  if (typeof window !== 'undefined') {
    if (isBrowserWindowPossible()) {
      if (!window.ErieGlobalPlayerEvents) window.ErieGlobalPlayerEvents = { [player_id]: new Map() }
      if (!window.ErieGlobalPlayerEvents[player_id]) window.ErieGlobalPlayerEvents[player_id] = new Map();
      let stop = window.ErieGlobalPlayerEvents[player_id].get('stop-event');
      if (stop) window.removeEventListener('keypress', stop);
      window.ErieGlobalPlayerEvents[player_id].delete('stop-event');
    } else {
      if (!Globals.ErieGlobalPlayerEvents[player_id]) Globals.ErieGlobalPlayerEvents[player_id] = new Map();
      Globals.ErieGlobalPlayerEvents[player_id].delete('stop-event');
    }
  }
}


export function setErieGlobalStreamingControl(player_id: string, key: keyof GlobalStreamingControl, value: any) {
  if (isBrowserWindowPossible()) {
    // @ts-ignore
    if (!('ErieGlobalStreamingControl' in window)) window.ErieGlobalStreamingControl = { [player_id]: {} as GlobalStreamingControl };
    if (!window.ErieGlobalStreamingControl[player_id]) window.ErieGlobalStreamingControl[player_id] = {} as GlobalStreamingControl;
    window.ErieGlobalStreamingControl[player_id][key] = value;
  } else {
    if (!Globals.ErieGlobalStreamingControl[player_id]) Globals.ErieGlobalStreamingControl[player_id] = {} as GlobalStreamingControl;
    Globals.ErieGlobalStreamingControl[player_id][key] = value;
  }
}

