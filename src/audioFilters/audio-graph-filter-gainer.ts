// This is a basic sample for how to define a custom filter

import { AudioFilterPrototype } from "./audio-graph-filter-class";
import { AudioFilterEncoder, AudioFilterFinisher, Glyph, RamperCollection } from "../types";
import { rampBy } from "../player/audio-graph-ramp";

export class GainerFilter extends AudioFilterPrototype {
  attackTime: number;
  releaseTime: number;
  filter: GainNode;

  constructor(ctx: AudioContext | OfflineAudioContext) {
    super(ctx);
    // always needs an (offline) audio context
    this.ctx = ctx;
    // static parameters
    this.attackTime = 0.1;
    this.releaseTime = 0.1
    // always needs a `filter` property for dynamic parameters to be used by the encoder and finisher
    // the name can change but... just stick to this
    this.filter = ctx.createGain();
    // always needs a desitnation that is connectable; sometimes it can be something other than the filter object.
    // the name can never be changed because this is the property that other interfaces gonna access to this node.
    this.destination = this.filter;
  }
  // [required] this is ran when the filter is applied for the first time
  initialize(time: number) {
    this.filter.gain.cancelScheduledValues(time);
    this.filter.gain.setValueAtTime(0, time);
  }
  // the follwoing methods are required to satisfiy the basic audio node structure
  // [required] this defines how this filter connects itself to another node
  connect(node: AudioNode) {
    this.filter.connect(node);
  }
  // [required] this defines how this filter *dis*connects itself to another node
  disconnect(node: AudioNode) {
    this.filter.disconnect(node);
  }
}

// an encoder changes values at a time
// must use `rampBy` function as a standard interface for ramping functions
export const GainerEncoder = function (filter: GainerFilter, sound: Glyph, startTime: number, rampers?: RamperCollection) {
  rampBy(
    rampers?.gain2, // ramper methods (if provided, otherwise, 'linear')
    filter.filter.gain, // actual node to set the value
    sound.others?.gain2 ?? 1, // the gain value
    startTime + filter.attackTime // when the gain value kicks in
  );
} as AudioFilterEncoder

// a finisher sets the final values when the sound is done.
// must use `rampBy` function as a standard interface for ramping functions
export const GainerFinisher = function (filter: GainerFilter, sound: Glyph, startTime: number, duration: number, rampers?: RamperCollection) {
  rampBy(rampers?.gain2, filter.filter.gain, 0, (startTime || 0) + (duration || 1) - filter.releaseTime);
} as AudioFilterFinisher