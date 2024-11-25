export function isBrowserEventPossible() {
  return typeof document === 'object' && document?.body?.dispatchEvent
}
export function isBrowserWindowPossible() {
  return typeof window === 'object';
}