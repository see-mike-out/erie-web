import {
  GlobalControl,
  GlobalState,
  GlobalStreamingControl
} from "./types";
import { isBrowserWindowPossible } from "./util";

declare global {
  interface Window {
    ErieGlobalControl?: { [key: string]: GlobalControl | undefined };
    ErieGlobalState?: { [key: string]: GlobalState };
    ErieSampleBaseUrl?: { [key: string]: string };
    ErieGlobalPlayerEvents?: { [key: string]: Map<string, (e: KeyboardEvent) => void> };
    ErieGlobalStreamingControl: { [key: string]: GlobalStreamingControl };
  }
}

export const Globals: {
  ErieGlobalControl: { [key: string]: GlobalControl | undefined },
  ErieGlobalState: { [key: string]: GlobalState },
  ErieGlobalPlayerEvents: { [key: string]: Map<string, (e: KeyboardEvent) => void> },
  ErieSampleBaseUrl: { [key: string]: string },
  ErieGlobalStreamingControl: { [key: string]: GlobalStreamingControl };
} = {
  ErieGlobalControl: {},
  ErieGlobalState: {},
  ErieGlobalPlayerEvents: {},
  ErieSampleBaseUrl: {},
  ErieGlobalStreamingControl: {}
}

export function setSampleBaseUrl(player_id: string, url: string) {
  if (isBrowserWindowPossible()) {
    if (!window.ErieSampleBaseUrl) window.ErieSampleBaseUrl = {};
    window.ErieSampleBaseUrl[player_id] = url;
  } else {
    Globals.ErieSampleBaseUrl[player_id] = url;
  }
}

export function getSampleBaseUrl(player_id: string, url: string) {
  if (isBrowserWindowPossible()) {
    return window.ErieSampleBaseUrl?.[player_id];
  } else {
    return Globals.ErieSampleBaseUrl[player_id];
  }
}