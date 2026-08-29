import {
  RampAbrupt,
  RampExp,
  RampFunctionName,
  RampLinear
} from "../object";

export type RamperCollection = { [key: string]: RampFunctionName | undefined };

export const RamperNames = {
  [RampAbrupt]: 'setValueAtTime' as RampFunctionName,
  [RampLinear]: 'linearRampToValueAtTime' as RampFunctionName,
  [RampExp]: 'exponentialRampToValueAtTime' as RampFunctionName
}
