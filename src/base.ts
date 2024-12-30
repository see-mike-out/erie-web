import { GlobalControl, GlobalState } from "./types";
import { isBrowserWindowPossible } from "./util";

declare global {
  interface Window {
    ErieSampleBaseUrl?: string;
  }
}

export const Globals: {
  ErieGlobalControl: GlobalControl | undefined,
  ErieGlobalState: GlobalState,
  ErieGlobalPlayerEvents: Map<string, (e: KeyboardEvent) => void>,
  ErieSampleBaseUrl: string,
} = {
  ErieGlobalControl: undefined,
  ErieGlobalState: undefined,
  ErieGlobalPlayerEvents: new Map(),
  ErieSampleBaseUrl: 'audio_sample/'
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