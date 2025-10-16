import { PlaybackSpec, PlaybackTypes, PlaybackUnits } from "../types";

export class Playback {
  _init_by: typeof PlaybackTypes[number];
  _unit?: typeof PlaybackUnits[number];
  _condition?: string;
  _limit?: number;
  _speed?: number;
  _instrument?: string;

  constructor() {
    this._init_by = 'manual';
    this._unit = 'instance';
    this._limit = 3;
    this._speed = 1.5;
  }

  init_by(i: string) {
    if (PlaybackTypes.includes(i)) {
      this._init_by = i;
    } else {
      console.error("Unsupported playback initiation type.");
    }
    return this;
  }

  unit(i: string) {
    if (PlaybackUnits.includes(i)) {
      this._unit = i;
      if (this._unit != 'condition') {
        this._condition = undefined;
      }
    } else {
      console.error("Unsupported playback unit type.");
    }
    return this;
  }

  condition(i: string) {
    if (typeof i === 'string') {
      this._unit = i;
    } else {
      console.error("A playback condition must be a string.");
    }
    return this;
  }

  limit(i: number) {
    if (typeof i === 'number') {
      this._limit = i;
    } else {
      console.error("Playback limit must be a number.");
    }
    return this;
  }

  speed(i: number) {
    if (typeof i === 'number') {
      this._speed = i;
    } else {
      console.error("Playback speed must be a number.");
    }
    return this;
  }

  instrument(i: string) {
    if (typeof i === 'string') {
      this._instrument = i;
    } else {
      console.error("Playback instrument must be a string.");
    }
    return this;
  }

  get(): PlaybackSpec {
    return {
      init_by: this._init_by,
      unit: this._unit,
      condition: this._condition,
      limit: this._limit,
      speed: this._speed,
      instrument: this._instrument
    }
  }

  clone(): Playback {
    let c = new Playback();
    if (this._init_by !== undefined) c.init_by(this._init_by);
    if (this._unit !== undefined) c.unit(this._unit);
    if (this._condition !== undefined) c.condition(this._condition)
    if (this._limit !== undefined) c.limit(this._limit)
    if (this._speed !== undefined) c.speed(this._speed)
    if (this._instrument !== undefined) c.instrument(this._instrument)
    return c;
  }
}