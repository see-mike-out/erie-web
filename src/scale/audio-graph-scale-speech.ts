import { format } from "d3";
import { NormalizedEncodingItem, ParsedScaleDefinition, ParsedScaleFunction, ParsedScaleProperties, RecordObject } from "../types";

export function makeSpeechChannelScale(
  channel: string,
  encoding: ParsedScaleDefinition,
  values: any[],
  info: RecordObject,
): ParsedScaleFunction {
  // consider details
  // format?
  let scale, scaleProperties: ParsedScaleProperties = {
    channel,
    encodingType: encoding.type
  }
  if (encoding.format) {
    let formatFun = format(encoding.format);
    if (formatFun) {
      // 
      scale = (d: any) => formatFun(d);
    } else {
      scale = (d: any) => nullToNull(d);
    }
  } else {
    scale = (d: any) => nullToNull(d);
  }
  scale = scale as ParsedScaleFunction;
  scale.properties = scaleProperties;
  return scale;
}

function nullToNull(d: any) {
  if (d === null || d === undefined) return 'null';
  else return d;
}