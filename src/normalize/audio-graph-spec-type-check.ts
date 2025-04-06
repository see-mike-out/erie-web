import { InSeqOverlayStreamSpec, NormalizedSingleStream, OVERLAY, OverlayStreamSpec, SEQUENCE, SingleStreamSpec, StreamingSpec, TopLevelSpec, UnitStreamSpec } from "../types";

export function isRepeatedStream(spec: TopLevelSpec | NormalizedSingleStream): boolean {
  if (spec && ('encoding' in spec) && spec.encoding?.repeat) {
    return true;
  }
  return false;
}

export function isSingleStream(spec: TopLevelSpec): spec is SingleStreamSpec {
  if (spec && 'encoding' in spec && 'tone' in spec && !(OVERLAY in spec) && !(SEQUENCE in spec)) {
    return true;
  }
  return false;
}

export function isOverlayStream(spec: TopLevelSpec): spec is OverlayStreamSpec {
  if (spec && !('encoding' in spec) && !('tone' in spec) && (OVERLAY in spec) && !(SEQUENCE in spec)) {
    return true;
  }
  return false;
}

export function isSequenceStream(spec: any): spec is UnitStreamSpec | InSeqOverlayStreamSpec {
  if (spec && !('encoding' in spec) && !('tone' in spec) && !(OVERLAY in spec) && (SEQUENCE in spec)) {
    return true;
  }
  return false;
}

export function isStreamingStream(spec: TopLevelSpec): spec is StreamingSpec {
  if (spec && 'encoding' in spec && 'tone' in spec && !(OVERLAY in spec) && !(SEQUENCE in spec) && 'stream' in spec.data && spec.data.stream) {
    return true;
  }
  return false;
}
