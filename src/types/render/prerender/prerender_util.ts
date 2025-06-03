import {
  PreGraphItem,
  PreGraphOverlay,
  PreGraphPause,
  PreGraphSound,
  PreGraphSpeechItem,
  PreGraphUnit
} from "./prerender_type";

export function isTextInfo(
  item: PreGraphItem
): item is PreGraphSpeechItem {
  return 'speech' in item;
}

export function isSoundInfo(
  item: PreGraphItem
): item is PreGraphSound {
  return 'instrument_type' in item;
}

export function isPauseInfo(
  item: PreGraphItem
): item is PreGraphPause {
  return 'duration' in item && Object.keys(item).length == 1;
}

export function isGlyphInfo(
  item: PreGraphItem
): item is PreGraphSound {
  return 'start' in item;
}

export function isToneSeriesInfo(
  item: PreGraphItem
): item is PreGraphUnit {
  return 'sounds' in item;
}

export function isToneOverlayInfo(
  item: PreGraphItem
): item is PreGraphOverlay {
  return 'overlays' in item;
}
