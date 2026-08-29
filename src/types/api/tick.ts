import { OscType } from "../object"

export interface TickObject {
  name?: string,
  interval?: number,
  band?: number,
  playAtTime0?: boolean,
  oscType?: OscType,
  pitch?: number
  loudness?: number,
  description?: string
}
