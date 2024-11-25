import { ConfigInterface, ScaleConsistencyRecord } from "../types";
import {
  jType
} from "../util";



export function normalizeScaleConsistency(config: ConfigInterface, used_channels: string[]) {
  let overlayScaleConsistency: ScaleConsistencyRecord = {},
    forceOverlayScaleConsistency: ScaleConsistencyRecord = {},
    sequenceScaleConsistency: ScaleConsistencyRecord = {},
    forceSequenceScaleConsistency: ScaleConsistencyRecord = {};
  for (const chn of used_channels) {
    // overlayScaleConsistency
    if (config.overlayScaleConsistency instanceof Object
      && config.overlayScaleConsistency?.[chn] !== undefined) {
      overlayScaleConsistency[chn] = config.overlayScaleConsistency[chn];
    } else if (typeof config.overlayScaleConsistency === 'boolean') {
      overlayScaleConsistency[chn] = config.overlayScaleConsistency;
    } else {
      // default 
      overlayScaleConsistency[chn] = true;
    }

    // forceOverlayScaleConsistency
    if (
      config.forceOverlayScaleConsistency instanceof Object
      && config.forceOverlayScaleConsistency?.[chn] !== undefined) {
      forceOverlayScaleConsistency[chn] = config.forceOverlayScaleConsistency[chn];
    } else if (typeof config.forceOverlayScaleConsistency === 'boolean') {
      forceOverlayScaleConsistency[chn] = config.forceOverlayScaleConsistency;
    } else {
      // default
      forceOverlayScaleConsistency[chn] = false;
    }

    // sequenceScaleConsistency
    if (
      config.sequenceScaleConsistency instanceof Object
      && config.sequenceScaleConsistency?.[chn] !== undefined) {
      sequenceScaleConsistency[chn] = config.sequenceScaleConsistency[chn];
    } else if (typeof config.sequenceScaleConsistency === 'boolean') {
      sequenceScaleConsistency[chn] = config.sequenceScaleConsistency;
    } else {
      // default
      sequenceScaleConsistency[chn] = true;
    }

    // forceOverlayScaleConsistency
    if (
      config.forceSequenceScaleConsistency instanceof Object
      && config.forceSequenceScaleConsistency?.[chn] !== undefined) {
      forceSequenceScaleConsistency[chn] = config.forceSequenceScaleConsistency[chn];
    } else if (typeof config.forceSequenceScaleConsistency === 'boolean') {
      forceSequenceScaleConsistency[chn] = config.forceSequenceScaleConsistency;
    } else {
      // default 
      forceSequenceScaleConsistency[chn] = false;
    }
  }
  
  // reassign values
  config.overlayScaleConsistency = overlayScaleConsistency;
  config.forceOverlayScaleConsistency = forceOverlayScaleConsistency;
  config.sequenceScaleConsistency = sequenceScaleConsistency;
  config.forceSequenceScaleConsistency = forceSequenceScaleConsistency;
}