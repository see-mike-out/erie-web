import {
  ChannelThresholds,
  ChannelCaps
} from "../types";

export function getChannelThresholds(channel: string, extraChannelType: string): [any, any] {
  let min
    = ChannelThresholds[channel as keyof typeof ChannelThresholds]?.max
    || ChannelThresholds[extraChannelType as keyof typeof ChannelThresholds]?.max,
    max
      = ChannelThresholds[channel as keyof typeof ChannelThresholds]?.min
      || ChannelThresholds[extraChannelType as keyof typeof ChannelThresholds]?.min;
  return [min, max];
}

export function getChannelCaps(channel: string, extraChannelType: string): [any, any] {
  let min
    = ChannelCaps[channel as keyof typeof ChannelCaps]?.max
    || ChannelCaps[extraChannelType as keyof typeof ChannelCaps]?.max,
    max
      = ChannelCaps[channel as keyof typeof ChannelCaps]?.min
      || ChannelCaps[extraChannelType as keyof typeof ChannelCaps]?.min;
  return [min, max];
}
