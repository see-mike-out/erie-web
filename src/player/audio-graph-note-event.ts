import { isBrowserEventPossible } from "../util/audio-graph-check-env";

export function emitNotePlayEvent(
  type: string,
  note: any
) {
  if (isBrowserEventPossible()) {
    document.body.dispatchEvent(new CustomEvent("erieOnNotePlay", {
      detail: {
        type,
        note
      }
    }));
  }
}

export function emitNoteStopEvent(
  type: string,
  note: any
) {
  if (isBrowserEventPossible()) {
    document.body.dispatchEvent(new CustomEvent("erieOnNoteStop", {
      detail: {
        type,
        note
      }
    }));
  }
}