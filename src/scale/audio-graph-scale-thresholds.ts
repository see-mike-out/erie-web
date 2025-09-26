import {
  ChannelThresholds,
  ChannelCaps
} from "../types";

//  [max, min]

export function getChannelThresholds(channel: string, extraChannelType: string): [any, any] {
  let max
    = ChannelThresholds[channel as keyof typeof ChannelThresholds]?.max
    ?? ChannelThresholds[extraChannelType as keyof typeof ChannelThresholds]?.max;
  let min
    = ChannelThresholds[channel as keyof typeof ChannelThresholds]?.min
    ?? ChannelThresholds[extraChannelType as keyof typeof ChannelThresholds]?.min;
  return [max, min];
}

export function getChannelCaps(channel: string, extraChannelType: string): [any, any] {
  let max
    = ChannelCaps[channel as keyof typeof ChannelCaps]?.max
    ?? ChannelCaps[extraChannelType as keyof typeof ChannelCaps]?.max;
  let min
    = ChannelCaps[channel as keyof typeof ChannelCaps]?.min
    ?? ChannelCaps[extraChannelType as keyof typeof ChannelCaps]?.min;
  return [max, min];
}
