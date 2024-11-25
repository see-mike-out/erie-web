export const TU_SEC = "second",
  TU_BEAT = "beat";

export type TimeUnitUnits = typeof TU_SEC
  | typeof TU_BEAT;

export const TU_Always = 'always',
  TU_Start = 'start',
  TU_Never = 'never';

export interface TimeUnit {
  unit: typeof TU_SEC | typeof TU_BEAT,
  tempo?: number,
  rounding?: typeof TU_Always | typeof TU_Start | typeof TU_Never;
  roundingBy?: number;
}