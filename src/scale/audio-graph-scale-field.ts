import { noteToFreq } from "../util";
import { jType } from "../util/audio-graph-typing-util";
import { PITCH_chn } from "../types";

export function makeFieldedScaleFunction(
  channel: string | string[],
  encoding, values, info, data) {
  let scaleProperties = {
    channel,
  }
  let mapper = {};
  let findKey = encoding.scale.range.field;
  let encKey = encoding.field[0];
  for (const datum of data) {
    let r = datum[findKey];
    if ((channel === PITCH_chn) && typeof r !== 'number') {
      r = noteToFreq(r);
    }
    mapper[datum[encKey]] = r;
  }
  scaleProperties.rangeProvided = true;
  scaleProperties.domain = Object.keys(mapper);
  scaleProperties.range = Object.values(mapper);
  // make the scale function
  let scaleFunction = (k) => {
    return mapper[k];
  };
  scaleFunction.properties = scaleProperties;
  return scaleFunction;
}