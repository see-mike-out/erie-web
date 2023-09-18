import { makeParamFilter } from "../util/audio-graph-scale-util";
import { deepcopy } from "../util/audio-graph-util";

export function makeStaticScaleFunction(channel, encoding, values, info) {
  let value = encoding.value;
  let condition = deepcopy(encoding.condition || []);
  let scaleProperties = {
    channel,
  }
  if (condition) {
    let conditions = [];
    if (condition.constructor.name === "Object") {
      conditions.push(condition);
    } else {
      conditions.push(...condition);
    }
    conditions = conditions.filter((cond) => cond.test !== undefined);
    let finalConditions = [];
    scaleProperties.conditions = [];
    for (const cond of conditions) {
      let fCond;
      if (cond.test !== undefined) {
        let test = cond.test;
        fCond = {};
        if (test?.constructor.name === "Array") {
          fCond.test = (d) => { return test.includes(d) };

        } else if (test?.not?.constructor.name === "Array") {
          fCond.test = (d) => { return !test.not.includes(d) };
        } else {
          fCond.test = makeParamFilter(test);
        }
      }
      if (fCond !== undefined) {
        fCond.value = cond.value;
        finalConditions.push(fCond);
      }
      scaleProperties.conditions.push([test, cond.value]);
    }
    let scale = (d) => {
      let output;
      for (const fCond of finalConditions) {
        output = fCond.test(d) ? fCond.value : output;
      }
      if (output === undefined) output = value;
      return output;
    }
    scale.properties = scaleProperties;
    return scale
  } else {
    let scale = (d) => { return value };
    scale.properties = scaleProperties;
    return scale;
  }
}