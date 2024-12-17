import { SingleTapPosType } from "../encoding";
import { BeatObject } from "../internal";

export type PuaseMarker = {
  rate?: number,
  length?: number
};

export type TapCountValue = {
  value: number,
  tapLength: number,
  pause: PuaseMarker,
  beat: BeatObject
}

export type TapSpeedValue = {
  value: number,
  tapDuration: number,
  tappingUnit: number,
  singleTappingPosition: SingleTapPosType,
  beat: BeatObject
}

export type TapValue = {
  count: number, speed: number
} | number;