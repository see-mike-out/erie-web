export function emitNoteEvent(type, note) {
  if (typeof document === 'object') {
    document.body.dispatchEvent(new CustomEvent("erieNoteEvent", {
      detail: {
        type,
        note
      }
    }));
  }
}