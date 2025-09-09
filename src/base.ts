import {
  GlobalControl,
  GlobalState,
  GlobalStreamingControl
} from "./types";
import { isBrowserWindowPossible } from "./util";

declare global {
  interface Window {
    ErieGlobalControl?: GlobalControl;
    ErieGlobalState?: GlobalState;
    ErieSampleBaseUrl?: string;
    ErieGlobalPlayerEvents?: Map<string, (e: KeyboardEvent) => void>;
    ErieGlobalStreamingControl: GlobalStreamingControl;
  }
}

export const Globals: {
  ErieGlobalControl: GlobalControl | undefined,
  ErieGlobalState: GlobalState,
  ErieGlobalPlayerEvents: Map<string, (e: KeyboardEvent) => void>,
  ErieSampleBaseUrl: string,
  ErieGlobalStreamingControl: GlobalStreamingControl;
} = {
  ErieGlobalControl: undefined,
  ErieGlobalState: undefined,
  ErieGlobalPlayerEvents: new Map(),
  ErieSampleBaseUrl: 'audio_sample/',
  ErieGlobalStreamingControl: {} as GlobalStreamingControl
}

export function setSampleBaseUrl(url: string) {
  if (isBrowserWindowPossible()) {
    window.ErieSampleBaseUrl = url;
  } else {
    Globals.ErieSampleBaseUrl = url;
  }
}

export function getSampleBaseUrl(url: string) {
  if (isBrowserWindowPossible()) {
    return window.ErieSampleBaseUrl;
  } else {
    return Globals.ErieSampleBaseUrl;
  }
}