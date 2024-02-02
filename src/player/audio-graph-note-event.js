export function emitNotePlayEvent(type, note) {
  if (typeof document === 'object') {
    document.body.dispatchEvent(new CustomEvent("erieOnNotePlay", {
      detail: {
        type,
        note
      }
    }));
  }
}

export function emitNoteStopEvent(type, note) {
  if (typeof document === 'object') {
    document.body.dispatchEvent(new CustomEvent("erieOnNoteStop", {
      detail: {
        type,
        note
      }
    }));
  }
}