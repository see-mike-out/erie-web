import { noteToFreq } from "../util/audio-graph-scale-util";
import { jType } from "../util/audio-graph-typing-util";
import { deepcopy } from "../util/audio-graph-util";
import { NomPalletes, repeatPallete } from "./audio-graph-palletes";
import { PITCH_chn, QUANT, REPEAT_chn, TMP } from "./audio-graph-scale-constant";
import { makeTimeLevelFunction, makeTimeUnitFunction, timeUnitDomain } from "./audio-graph-scale-temp";

export function updateScaleDomain(scale, values) {
  let prevDomain = scale.properties.domain;
  let channel = scale.properties.channel;
  let encType = scale.properties.encodingType;
  if (jType(scale.properties.domainSpecified) === 'Array' && scale.properties.domainSpecified.every(d => d)) {
    return scale;
  } else if (scale.properties.domainSpecified) {
    return scale;
  } else {
    if (encType === QUANT) {
      let domainMin = Math.min(...values), domainMax = Math.max(...values);
      let newDomain = [...prevDomain];
      let domainChanged = false;
      if (newDomain[0] > domainMin) {
        domainChanged = true;
        newDomain[0] = domainMin;
      }
      if (newDomain[newDomain.length - 1] < domainMax) {
        domainChanged = true;
        newDomain[newDomain.length - 1] = domainMax;
      }
      if (domainChanged) {
        scale.domain(newDomain)
        scale.properties.domain = [...newDomain];
      }
    } else if (encType === TMP) {
      // has Time unit
      if (scale.properties.timeUnit) {
        let _values = [...values, prevDomain]
        let ordScale = makeOrdinalScaleFunction(channel, {
          domain: timeUnitDomain(scaleDef?.domain, scale.properties.timeUnit, scale.properties.dayName),
          range: scale.properties.range,
          polarity: scale.properties.polarity,
          maxDistinct: scale.properties.maxDistinct
        }, _values, {}, {
          polarity: scale.properties.polarity,
          maxDistinct: scale.properties.maxDistinct,
          times: scale.properties.times
        });
        let timeUnitFunction = makeTimeUnitFunction(encoding?.timeUnit, encoding?.dayName);
        Object.assign(scale.properties, ordScale.properties);
        let scaleFunction = (d) => {
          return ordScale(timeUnitFunction(d));
        }
        scaleFunction.properties = deepcopy(scale.properties);
        return scaleFunction
      }

      // time level 
      let timeLevelFunction = makeTimeLevelFunction(scale.properties?.timeLevel);
      let newDomain = [...prevDomain];
      let leveledValues = values.map(timeLevelFunction);
      let domainMin = Math.min(...leveledValues), domainMax = Math.max(...leveledValues);
      let domainChanged = false;

      if (jType(scale.properties.domainSpecified) === 'Array') {
        if (scale.properties.domainSpecified.length == 2) {
          if (!scale.properties.domainSpecified[0]) {
            if (newDomain[0] > domainMin) {
              domainChanged = true;
              newDomain[0] = domainMin;
            }
          }
          if (!scale.properties.domainSpecified[1]) {
            if (newDomain[1] < domainMax) {
              domainChanged = true;
              newDomain[1] = domainMax;
            }
          }
        } else if (scale.properties.domainSpecified.length == 3) {
          if (!scale.properties.domainSpecified[0]) {
            if (newDomain[0] > domainMin) {
              domainChanged = true;
              newDomain[0] = domainMin;
            }
          }
          if (!scale.properties.domainSpecified[2]) {
            if (newDomain[2] < domainMax) {
              domainChanged = true;
              newDomain[2] = domainMax;
            }
          }
        }
      } else {
        if (newDomain[0] > domainMin) {
          domainChanged = true;
          newDomain[0] = domainMin;
        }
        if (newDomain[newDomain.length - 1] < domainMax) {
          domainChanged = true;
          newDomain[newDomain.length - 1] = domainMax;
        }
      }
      if (domainChanged) {
        scale.domain(newDomain)
        scale.properties.domain = [...newDomain];
      }

    } else if (encType === ORD) {
      let sortFunction;
      if (scale.properties.sort === "descending") {
        sortFunction = descending();
      } else {
        sortFunction = ascending();
      }
      let newDomain = unique([...values, ...prevDomain]).toSorted(sortFunction);
      if (newDomain.length != - prevDomain.length) {
        scale.domain(newDomain);
        scale.properties.domain = [...newDomain];
      }
    } else if (encType === NOM) {
      let newDomain = unique([...values, ...prevDomain]).toSorted(sortFunction);
      if (newDomain.length != - prevDomain.length) {
        scale.domain(newDomain);
        scale.properties.domain = [...newDomain];

        let newRange;
        if (scale.properties.times && !rangeProvided) {
          newRange = newDomain.map(d => d * times);
        }
        if (!scale.properties.rangeProvided && channel !== REPEAT_chn) {
          newRange = repeatPallete(NomPalletes[channel], newDomain.length);
        } else if (channel === REPEAT_chn) {
          newRange = newDomain.map((d, i) => i);
        }
        // note for pitch  -> freq 
        if (channel === PITCH_chn && !range.every(d => jType(d) === "Number")) {
          newRange = newRange.map(noteToFreq);
        }
        scale.range(newRange);
        scale.properties.domain = [...newRange];
      }
    }
  }
  return scale;
}