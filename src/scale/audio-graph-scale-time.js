import { deepcopy } from "../util/audio-graph-util";
import { TIME_chn, REL_TIMING, DEF_DUR, TMP, ORD, NOM, STATIC, QUANT, SIM_TIMING } from "./audio-graph-scale-constant";
import { makeNominalScaleFunction } from "./audio-graph-scale-nom";
import { makeOrdinalScaleFunction } from "./audio-graph-scale-ord";
import { makeQuantitativeScaleFunction } from "./audio-graph-scale-quant";
import { makeStaticScaleFunction } from "./audio-graph-scale-static";
import { makeTemporalScaleFunction } from "./audio-graph-scale-temp";

// only for the time scale
export function makeTimeChannelScale(channel, _encoding, values, info, scaleType, beat) {
  let encoding = deepcopy(_encoding);
  let scaleDef = encoding?.scale;
  if (encoding.type === NOM && !scaleDef.timing) {
    scaleDef.timing = REL_TIMING
  }
  let isRelative = scaleDef.timing === REL_TIMING,
    isSimultaneous = scaleDef.timing === SIM_TIMING,
    band = scaleDef?.band || DEF_DUR, length = scaleDef?.length || 5;
  if (beat?.converter) {
    band = beat.converter(scaleDef?.band || 1), length = beat.converter(length);
  }
  if (encoding?.scale?.range === undefined && scaleDef?.band !== undefined) {
    encoding.scale.range = [0, length - band];
  } else if (encoding?.scale?.range === undefined) {
    encoding.scale.range = [0, length];
  }
  let scale1;
  // single-time channel
  if (isRelative) {
    scale1 = (t1) => {
      return 'after_previous';
    };
    scale1.properties = {
      channel,
      timing: REL_TIMING,
    }
  } else if (isSimultaneous) {
    scale1 = (t1) => {
      return 0;
    };
    scale1.properties = {
      channel,
      timing: SIM_TIMING,
    }
  } else if (scaleType?.encodingType === QUANT) {
    scale1 = makeQuantitativeScaleFunction(TIME_chn, encoding, values, info);
  } else if (scaleType?.encodingType === TMP) {
    scale1 = makeTemporalScaleFunction(TIME_chn, encoding, values, info);
  } else if (scaleType?.encodingType === ORD) {
    scale1 = makeOrdinalScaleFunction(TIME_chn, encoding, values, info);
  } else if (scaleType?.encodingType === NOM) {
    scale1 = makeNominalScaleFunction(TIME_chn, encoding, values, info);
  } else if (scaleType?.encodingType === STATIC) {
    scale1 = makeStaticScaleFunction(TIME_chn, encoding, values, info);
  }
  if (!scale1) {
    console.error("Wrong scale definition for the time channel", scaleDef);
  }
  let scaleFunction = (t1, t2) => {
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