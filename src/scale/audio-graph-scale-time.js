import { jType } from "../util/audio-graph-typing-util";
import { deepcopy } from "../util/audio-graph-util";
import { TIME2_chn, TIME_chn, REL_TIMING, DEF_DUR, TMP, ORD, NOM, STATIC, QUANT, SIM_TIMING } from "./audio-graph-scale-constant";
import { makeNominalScaleFunction } from "./audio-graph-scale-nom";
import { makeOrdinalScaleFunction } from "./audio-graph-scale-ord";
import { makeQuantitativeScaleFunction } from "./audio-graph-scale-quant";
import { makeStaticScaleFunction } from "./audio-graph-scale-static";
import { makeTemporalScaleFunction } from "./audio-graph-scale-temp";

// only for the time scale
export function makeTimeChannelScale(channel, _encoding, values, info, scaleType) {
  let { polarity, maxDistinct, times, zero, domainMax, domainMin, nice } = info;
  let encoding = deepcopy(_encoding);
  let hasTime2 = jType(channel) === "Array" && channel.length == 2 && channel[0] === TIME_chn && channel[1] === TIME2_chn;
  let scaleDef = encoding?.scale;
  if (encoding.type === NOM && !scaleDef.timing) {
    scaleDef.timing = REL_TIMING
  }
  let isRelative = scaleDef.timing === REL_TIMING,
    isSimultaneous = scaleDef.timing === SIM_TIMING,
    band = scaleDef?.band || DEF_DUR, length = scaleDef?.length || 5;
  // if (!hasTime2) {
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
    if (t2) {
      return { start: scale1(t1), end: scale1(t2) };
    } else {
      return { start: scale1(t1), duration: band };
    }
  };
  scaleFunction.properties = scale1.properties;
  return scaleFunction
  // } 
  // else {
  //   if (encoding?.scale?.range === undefined) {
  //     encoding.scale.range = [0, length];
  //   }
  //   let scale;
  //   encoding.scale.domain = [domainMin, domainMax];
  //   let mergedValues = [...(values[0] || []), ...(values[1] || [])].toSorted(ascending);
  //   if (zero) encoding.scale.domain = [0, domainMax];
  //   if (scaleType?.encodingType === TMP) {
  //     info.domainMin = new Date(domainMin);
  //     info.domainMax = new Date(domainMax);
  //     scale = makeTemporalScaleFunction(TIME_chn, encoding, mergedValues, info);
  //   } else if (scaleType?.encodingType === QUANT) {
  //     scale = makeQuantitativeScaleFunction(TIME_chn, encoding, mergedValues, info);
  //   } else if (scaleType?.encodingType === ORD) {
  //     scale = makeOrdinalScaleFunction(TIME_chn, encoding, mergedValues, info);
  //   } else if (scaleType?.encodingType === NOM) {
  //     encoding.scale.domain = unique(mergedValues);
  //     scale = makeNominalScaleFunction(TIME_chn, encoding, mergedValues, info);
  //   } else if (scaleType?.encodingType === STATIC) {
  //     scale = makeStaticScaleFunction(TIME_chn, encoding, mergedValues, info);
  //   }
  //   if (!scale) {
  //     console.error("Wrong scale definition for the time channel", scaleDef);
  //   }
  //   let scaleFunction = (t1, t2) => {
  //     let start = scale(t1), end = scale(t2);
  //     if (start <= end) {
  //       return { start, end };
  //     } else {
  //       return { start: end, end: start };
  //     }
  //   };
  //   scaleFunction.properties = scale.properties;
  //   scaleFunction.properties.hasTime2 = true;
  //   return scaleFunction;
  // }
}