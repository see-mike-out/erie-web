import { InSeqOverlayStreamSpec, OVERLAY, OverlayStreamSpec, SEQUENCE, TopLevelSpec, UnitStreamSpec } from "../types";

export function isRepeatedStream(spec: TopLevelSpec): boolean {
  if (spec && ('encoding' in spec) && spec.encoding?.repeat) {
    return true;
  }
  return false;
}

export function isSingleStream(spec: TopLevelSpec): boolean {
  if (spec && 'encoding' in spec && 'tone' in spec && !(OVERLAY in spec) && !(SEQUENCE in spec)) {
    return true;
  }
  return false;
}

export function isOverlayStream(spec: TopLevelSpec): boolean {
  if (spec && !('encoding' in spec) && !('tone' in spec) && (OVERLAY in spec) && !(SEQUENCE in spec)) {
    return true;
  }
  return false;
}

export function isSequenceStream(spec: UnitStreamSpec | InSeqOverlayStreamSpec): boolean {
  if (spec && !('encoding' in spec) && !('tone' in spec) && !(OVERLAY in spec) && (SEQUENCE in spec)) {
    return true;
  }
  return false;
}