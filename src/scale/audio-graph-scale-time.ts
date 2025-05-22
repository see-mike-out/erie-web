import { makeNominalScaleFunction } from "./audio-graph-scale-nom";
import { makeOrdinalScaleFunction } from "./audio-graph-scale-ord";
import { makeQuantitativeScaleFunction } from "./audio-graph-scale-quant";
import { makeStaticScaleFunction } from "./audio-graph-scale-static";
import { makeTemporalScaleFunction } from "./audio-graph-scale-temp";
import {
  TIME_chn,
  REL,
  DEF_DUR,
  TMP,
  ORD,
  NOM,
  STATIC,
  QUANT,
  SIM,
  BeatObject,
  ParsedScaleDefinition,
  ParsedScaleFunction,
  RecordObject,
  ABS
} from "../types";
import { deepcopy } from "../util";

// only for the time scale
export function makeTimeChannelScale(
  channel: string,
  _encoding: ParsedScaleDefinition,
  values: any[] | undefined,
  info: RecordObject,
  scaleType: RecordObject,
  beat: BeatObject | undefined,
  is_streamed?: boolean
) {
  let encoding = deepcopy(_encoding);
  let scaleDef = encoding?.scale;
  if (encoding.type === NOM && !scaleDef.timing) {
    scaleDef.timing = REL
  }
  let isRelative = scaleDef.timing === REL,
    isSimultaneous = scaleDef.timing === SIM,
    band = scaleDef?.band || DEF_DUR,
    length = scaleDef?.length ?? 5;
  if (beat?.converter) {
    band = beat.converter(scaleDef?.band || 1), length = beat.converter(length);
  }
  if (encoding?.scale?.range === undefined && scaleDef?.band !== undefined) {
    encoding.scale.range = [0, length - band];
  } else if (encoding?.scale?.range === undefined) {
    encoding.scale.range = [0, length];
  }
  let scale1!: ParsedScaleFunction;
  // single-time channel
  if (isRelative) {
    // @ts-ignore
    scale1 = (t1: any) => {
      return 'after_previous';
    };
    scale1.properties = {
      channel,
      encodingType: encoding.type,
      timing: REL,
    }
  } else if (isSimultaneous) {
    // @ts-ignore
    scale1 = (t1) => {
      return 0;
    };
    scale1.properties = {
      channel,
      encodingType: encoding.type,
      timing: SIM,
    }
  } else if (is_streamed && encoding?.scale?.times !== undefined) {
    // @ts-ignore
    scale1 = (t1) => {
      // @ts-ignore
      return t1 * encoding?.scale?.times;
      // todo: transformations?
    };
    scale1.properties = {
      channel,
      encodingType: encoding.type,
      timing: ABS,
    }
  } else if (scaleType?.encodingType === QUANT) {
    scale1 = makeQuantitativeScaleFunction(TIME_chn, encoding, values, info, is_streamed);
  } else if (scaleType?.encodingType === TMP) {
    scale1 = makeTemporalScaleFunction(TIME_chn, encoding, values, info, is_streamed);
  } else if (scaleType?.encodingType === ORD) {
    scale1 = makeOrdinalScaleFunction(TIME_chn, encoding, values, info, is_streamed);
  } else if (scaleType?.encodingType === NOM) {
    scale1 = makeNominalScaleFunction(TIME_chn, encoding, values, info, is_streamed);
  } else if (scaleType?.encodingType === STATIC) {
    scale1 = makeStaticScaleFunction(TIME_chn, encoding, values, info);
  }
  if (!scale1) {
    console.error("Wrong scale definition for the time channel", scaleDef);
  }
  // @ts-ignore
  let scaleFunction: ParsedScaleFunction = (t1: any, t2: any) => {
    if (t2 !== undefined) {
      return {
        start: (beat?.roundStart ? beat?.roundStart(scale1(t1)) : scale1(t1)),
        end: (beat?.roundDuration ? beat?.roundDuration(scale1(t2)) : scale1(t2))
      };
    } else {
      return {
        start: (beat?.roundStart ? beat?.roundStart(scale1(t1)) : scale1(t1)),
        duration: (beat?.roundDuration ? beat?.roundDuration(band) : band)
      };
    }
  };
  scaleFunction.properties = scale1.properties;
  scaleFunction.properties.length = length;
  return scaleFunction;
}