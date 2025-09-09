import { transformData } from "./audio-graph-data-transform";
import {
  NOM,
  ORD,
  TMP,
  REPEAT_chn,
  NormalizedSingleStream,
  RecordObject,
  TransformerFunction
} from "../types";
import { deepcopy, unique } from "../util";

function get_forced_dimensions(spec: NormalizedSingleStream) {
  return Object.keys(spec.encoding).map((d) => {
    let enc = spec.encoding[d];
    if ('type' in enc && enc.type && [NOM, ORD, TMP].includes(enc.type)) {
      return enc.field;
    } else if (d === REPEAT_chn) {
      return enc.field;
    }
  }).filter((d) => d);
}

export function applyTransforms(data: RecordObject[], spec: NormalizedSingleStream): RecordObject[] {
  // transformations
  let forced_dimensions = get_forced_dimensions(spec);
  data = transformData(data, [...(spec.common_transform || []), ...(spec.transform || [])], unique(forced_dimensions));
  return data;
}

export function getTransformers(spec: NormalizedSingleStream): TransformerFunction {
  let forced_dimensions = get_forced_dimensions(spec);
  return (_dt: RecordObject[], dt_old?: RecordObject[]) => {
    let transforms = [...(spec.common_transform || []), ...(spec.transform || [])];
    let dt = deepcopy(_dt);
    if (dt_old && transforms.some(t => ('diffing' in t) && (t.carryOver ?? true))) {
      dt.splice(0, 0, ...deepcopy(dt_old))
    }
    return transformData(dt, transforms, unique(forced_dimensions))
  };
}