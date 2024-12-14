import { TimeUnit } from "./time";

export interface ConfigInterface {
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

export const ForceRepeatScale = 'forceRepeatScale',
  PlayAt = 'playScaleAt',
  BeforeAll = 'beforeAll',
  BeforeThis = 'beforeThis',
  AfterAll = 'afterAll',
  AfterThis = 'afterThis';