import { TimeUnit } from "../object"

export interface ConfigSpec {
  speechRate?: number,
  skipScaleSpeech?: boolean,
  skipDescription?: boolean,
  skipTitle?: boolean,
  overlayScaleConsistency?: boolean | ScaleConsistencyRecord,
  forceOverlayScaleConsistency?: boolean | ScaleConsistencyRecord,
  sequenceScaleConsistency?: boolean | ScaleConsistencyRecord,
  forceSequenceScaleConsistency?: boolean | ScaleConsistencyRecord,
  timeUnit?: TimeUnit,
  [key: string]: any
}

export type ScaleConsistencyRecord = {
  [key: string]: boolean
}
