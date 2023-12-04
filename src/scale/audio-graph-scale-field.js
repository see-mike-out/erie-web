import { noteToFreq } from "../util/audio-graph-scale-util";
import { jType } from "../util/audio-graph-typing-util";
import { PITCH_chn } from "./audio-graph-scale-constant";

export function makeFieldedScaleFunction(channel, encoding, values, info, data) {
  let scaleProperties = {
    channel,
  }
  let mapper = {};
  let findKey = encoding.scale.range.field;
  let encKey = encoding.field[0];
  for (const datum of data) {
    let r = datum[findKey];
    if ((channel === PITCH_chn) && jType(r) !== "Number") {
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