import { transformData } from "./audio-graph-data-transform";

import {
  NOM,
  ORD,
  TMP,
  REPEAT_chn,
  NormalizedSingleStream
} from "../types";
import { unique } from "../util";

export function applyTransforms(data: any[], spec: NormalizedSingleStream) {
  // transformations
  let forced_dimensions = Object.keys(spec.encoding).map((d) => {
    let enc = spec.encoding[d];
    if ('type' in enc && enc.type && [NOM, ORD, TMP].includes(enc.type)) {
      return enc.field;
    } else if (d === REPEAT_chn) {
      return enc.field;
    }
  }).filter((d) => d);

  data = transformData(data, [...(spec.common_transform || []), ...(spec.transform || [])], unique(forced_dimensions));
  return data;
}