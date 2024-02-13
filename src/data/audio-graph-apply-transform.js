import { NOM, ORD, REPEAT_chn, TMP } from "../scale/audio-graph-scale-constant";
import { unique } from "../util/audio-graph-util";
import { transformData } from "./audio-graph-data-transform";

export function applyTransforms(data, spec) {
  // transformations
  let forced_dimensions = Object.keys(spec.encoding).map((d) => {
    let enc = spec.encoding[d];
    if ([NOM, ORD, TMP].includes(enc.type)) {
      return enc.field;
    } else if (d === REPEAT_chn) {
      return enc.field;
    } else if (!enc.aggregate) {
      return enc.field;
    }
  }).filter((d) => d);

  data = transformData(data, [...(spec.common_transform || []), ...(spec.transform || [])], unique(forced_dimensions));
  return data;
}