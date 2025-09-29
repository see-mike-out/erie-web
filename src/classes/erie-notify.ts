import { Chimes } from "chimes";
import { bcp47language, NotifyItemSpec } from "types";

const Unset = 'unset',
  Chime = 'chime',
  Speech = 'speech',
  Sampling = 'sampling';

export class Notify {
  _type: string;
  _speech?: string;
  _loudness: number;
  _pitch?: number;
  _detune?: number;
  _language?: typeof bcp47language[number];
  _speechRate?: number;
  _chime?: keyof typeof Chimes;
  _sample?: string;

  constructor(t?: string) {
    this._type = Unset;
    if (t) this.type(t);
    this._loudness = 1;
    this._detune = 0;
  }

  type(t: string) {
    if ([Chime, Speech, Sampling].includes(t)) {
      this._type = t;
      if (this._type == Chime) {
        // cancel
        delete this._speech;
        delete this._language;
        delete this._speechRate;
        delete this._pitch;
        delete this._sample;
        delete this._detune;
      } else if (this._type == Speech) {
        // cancel
        delete this._chime;
        delete this._sample;
        delete this._detune;
      } else if (this._type == Sampling) {
        // cancel
        delete this._chime;
        delete this._speech;
        delete this._language;
        delete this._speechRate;
        delete this._pitch;
      }
    } else {
      console.warn("Unsupported type", t, "ignored.")
    }
    return this;
  }

  speech(t: string) {
    if (this._type == Unset) {
      this._type = Speech
    }
    if (this._type != Speech) {
      console.warn("Only supported for speech-type cnotifications.")
    } else if (typeof t == 'string') {
      this._speech = t;
    }
    return this;
  }

  loudness(n: number) {
    if (this._type == Unset) {
      this._type = Speech
    }
    if (typeof n == 'number' && n > 0) {
      this._loudness = n;
    }
    return this;
  }

  pitch(n: number) {
    if (this._type == Unset) {
      this._type = Speech
    }
    if (this._type != Speech) {
      console.warn("Only supported for speech-type cnotifications.")
    } else if (typeof n == 'number' && n > 0) {
      this._pitch = n;
    }
    return this;
  }

  detune(n: number) {
    if (this._type != Sampling) {
      console.warn("Only supported for sampling-type cnotifications.")
    } else if (typeof n == 'number' && n > 0) {
      this._detune = n;
    }
    return this;
  }

  language(s: string) {
    if (this._type == Unset) {
      this._type = Speech
    }
    if (this._type != Speech) {
      console.warn("Only supported for speech-type cnotifications.")
    } else if (typeof s == 'string' && bcp47language.includes(s)) {
      this._language = s;
    }
    return this;
  }

  chime(s: string) {
    if (this._type != Chime) {
      console.warn("Only supported for chime-type cnotifications.")
    } else if (isChimeName(s)) {
      this._chime = s;
    }
    return this;
  }

  sample(s: string) {
    if (this._type != Sampling) {
      console.warn("Only supported for sampling-type cnotifications.")
    } else if (typeof s == 'string') {
      this._sample = s;
    }
    return this;
  }


  get(): NotifyItemSpec | boolean | undefined {
    if (this._type == Unset) return undefined;
    else if (this._type == Speech) {
      if (this._speech) {
        return {
          speech: this._speech,
          loudness: this._loudness,
          pitch: this._pitch,
          language: this._language,
          speechRate: this._speechRate
        };
      } else {
        return true;
      }
    }
    else if (this._type == Sampling) {
      if (this._sample) {
        return {
          chime: this._sample,
          loudness: this._loudness,
        };
      } else {
        console.error("Undefined sampling URL")
      }
    }
    else if (this._type == Chime) {
      if (this._chime) {
        return {
          chime: this._chime,
          loudness: this._loudness,
        };
      } else {
        console.error("Undefined chime name")
      }
    }

  }

  clone(): Notify {
    let _c = new Notify();
    if (_c) {
      _c._type = this._type;
      _c._speech = this._speech;
      _c._loudness = this._loudness;
      _c._pitch = this._pitch;
      _c._detune = this._detune;
      _c._language = this._language;
      _c._speechRate = this._speechRate;
      _c._chime = this._chime;
      _c._sample = this._sample;
    }
    return _c;
  }
}

function isChimeName(s: string): s is (keyof typeof Chimes) {
  return (typeof s == 'string') && (s in Chimes);
}

export function intNotify() {
  return {
    incoming: new Notify(),
    beforePlayback: new Notify(),
    afterPlayback: new Notify(),
    beforePlay: new Notify(),
    afterPlay: new Notify(),
    next: new Notify()
  }
}