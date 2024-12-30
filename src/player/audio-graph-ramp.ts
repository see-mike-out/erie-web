import { RampFunctionName } from "../types";
import { ErieSynthFrequency } from "./audio-graph-synth";

export function rampBy(
  ramperType: RampFunctionName | undefined, // default -> linear
  param: AudioParam | ErieSynthFrequency, // any audio parameter that has ramping methods
  value: any, // the value to set
  time_at: number, // when to set the value
  speed?: number
) {
  switch (ramperType) {
    case 'exponentialRampToValueAtTime':
      // exponential ramping does not allow value 0
      param.exponentialRampToValueAtTime(value == 0 ? 0.0000000001 : value, time_at);
      break;
    case 'linearRampToValueAtTime':
      param.linearRampToValueAtTime(value, time_at);
      break;
    case 'setValueAtTime':
      param.setValueAtTime(value, time_at);
      break;
    case 'setTargetAtTime':
      if (speed !== undefined) param.setTargetAtTime(value, time_at, speed);
      else console.error("Speed paramemter must be defined for setTargetAtTime method.")
      break;
    default:
      param.linearRampToValueAtTime(value, time_at);
      break;
  }
}

// note: how rampers are processed
/*
Precondition: A ramping method can only defined for a continuous tone. 
1. A ramping method is first defined in a spec under a channel.
2. It is collected and passed along to a unit stream (only a unit stream) to aovid any potential collision.
3. When a unit stream is played, it is passed as configuration information and the proper ramping function is selected using the rampBy function.
*/