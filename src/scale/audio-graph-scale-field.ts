import { noteToFreq } from "../util";
import {
  FieldedRange,
  ParsedScaleDefinition,
  ParsedScaleFunction,
  ParsedScaleProperties,
  PITCH_chn,
  RecordObject
} from "../types";

export function makeFieldedScaleFunction(
  channel: string,
  encoding: ParsedScaleDefinition,
  values: any[], // for the shape
  info: RecordObject, // for the shape
  data: any[]) {
  let scaleProperties: ParsedScaleProperties = {
    channel,
    encodingType: encoding.type
  }
  let mapper: RecordObject = {};
  let findKey: string = (encoding.scale.range as FieldedRange).field;
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
  // @ts-ignore
  let scaleFunction: ParsedScaleFunction = (k: any) => {
    return mapper[k];
  };
  scaleFunction.properties = scaleProperties;
  return scaleFunction as ParsedScaleFunction;
}