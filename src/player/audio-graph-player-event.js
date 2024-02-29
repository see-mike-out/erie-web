import { isBrowserEventPossible } from "../util/audio-graph-check-env";

// event-related
export function sendToneStartEvent(detail) {
  if (isBrowserEventPossible()) {
    let playEvent = new CustomEvent("erieOnPlayTone", { detail });
    document.body.dispatchEvent(playEvent);
    let chnageEvent = new CustomEvent("erieOnStatusChange", { detail: { status: 'tone-started' } });
    document.body.dispatchEvent(chnageEvent);
  }
}
export function sendToneFinishEvent(detail) {
  if (isBrowserEventPossible()) {
    let playEvent = new CustomEvent("erieOnFinishTone", { detail });
    document.body.dispatchEvent(playEvent);
    let chnageEvent = new CustomEvent("erieOnStatusChange", { detail: { status: 'tone-finished' } });
    document.body.dispatchEvent(chnageEvent);
  }
}
export function sendSpeechStartEvent(detail) {
  if (isBrowserEventPossible()) {
    let playEvent = new CustomEvent("erieOnPlaySpeech", { detail });
    document.body.dispatchEvent(playEvent);
    let chnageEvent = new CustomEvent("erieOnStatusChange", { detail: { status: 'speech-started' } });
    document.body.dispatchEvent(chnageEvent);
  }
}
export function sendSpeechFinishEvent(detail) {
  if (isBrowserEventPossible()) {
    let playEvent = new CustomEvent("erieOnFinishSpeech", { detail });
    document.body.dispatchEvent(playEvent);
    let chnageEvent = new CustomEvent("erieOnStatusChange", { detail: { status: 'speech-finished' } });
    document.body.dispatchEvent(chnageEvent);
  }
}
export function sendQueueStartEvent(detail) {
  if (isBrowserEventPossible()) {
    let playEvent = new CustomEvent("erieOnPlayQueue", { detail });
    document.body.dispatchEvent(playEvent);
    let chnageEvent = new CustomEvent("erieOnStatusChange", { detail: { status: 'started' } });
    document.body.dispatchEvent(chnageEvent);
  }
}
export function sendQueueFinishEvent(detail) {
  if (isBrowserEventPossible()) {
    let playEvent = new CustomEvent("erieOnFinishQueue", { detail });
    document.body.dispatchEvent(playEvent);
    let chnageEvent = new CustomEvent("erieOnStatusChange", { detail: { status: 'finished' } });
    document.body.dispatchEvent(chnageEvent);
  }
}