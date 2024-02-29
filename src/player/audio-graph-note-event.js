import { isBrowserEventPossible } from "../util/audio-graph-check-env";

export function emitNotePlayEvent(type, note) {
  if (isBrowserEventPossible()) {
    document.body.dispatchEvent(new CustomEvent("erieOnNotePlay", {
      detail: {
        type,
        note
      }
    }));
  }
}

export function emitNoteStopEvent(type, note) {
  if (isBrowserEventPossible()) {
    document.body.dispatchEvent(new CustomEvent("erieOnNoteStop", {
      detail: {
        type,
        note
      }
    }));
  }
}