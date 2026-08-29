import {
  Condition,
  ConditionFunction,
  ConditionItem,
  ParsedScaleDefinition,
  ParsedScaleFunction,
  ParsedScaleProperties,
  RecordObject
} from "../types";
import {
  deepcopy,
  makeParamFilter
} from "../util";

export function makeStaticScaleFunction(
  channel: string,
  encoding: ParsedScaleDefinition,
  values: any[] | undefined,
  info: RecordObject
): ParsedScaleFunction {
  let value = encoding.value;
  let condition = deepcopy(encoding.condition || []);
  let scaleProperties: ParsedScaleProperties = {
    channel,
    encodingType: encoding.type
  }
  if (condition) {
    let conditions: Condition = [];
    if (condition instanceof Object && 'test' in condition && 'value' in condition) {
      conditions.push(condition as ConditionItem);
    } else {
      conditions.push(...condition);
    }
    conditions = conditions.filter((cond) => cond.test !== undefined);
    let finalConditions = [];
    scaleProperties.conditions = [] as Condition;
    for (const cond of conditions) {
      let fTest!: (d: any) => boolean;
      if (cond.test !== undefined) {
        let test = cond.test;
        if (test instanceof Array) {
          fTest = (d: string | string[]) => { return test.includes(d) };
        } else if (test instanceof Object && 'not' in test && test?.not instanceof Array) {
          fTest = (d: string | string[]) => { return !test.not.includes(d) };
        } else {
          fTest = makeParamFilter(test as string) ?? ((d: any) => false);
        }

      }
      if (fTest !== undefined) {
        let fCond: ConditionFunction = { test: fTest, value: cond.value };
        finalConditions.push(fCond);
      }
      scaleProperties.conditions.push({ test: cond.test, value: cond.value });
    }
    // @ts-ignore
    let scale: ParsedScaleFunction = (d: any) => {
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
    // @ts-ignore
    let scale: ParsedScaleFunction = (d) => { return value };
    scale.properties = scaleProperties;
    return scale;
  }
}