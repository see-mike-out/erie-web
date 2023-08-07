import { NOM, ORD, TMP } from "../scale/audio-graph-scale-constant";
import { transformData } from "./audio-graph-data-transform";

export function applyTransforms(data, spec) {
  // transformations
  let forced_dimensions = Object.keys(spec.encoding).map((d) => {
    let enc = spec.encoding[d];
    if ([NOM, ORD, TMP].includes(enc.type)) {
      return enc.field;
    }
  }).filter((d) => d);

  data = transformData(data, [...(spec.common_transform || []), ...(spec.transform || [])], forced_dimensions);
  return data;
}