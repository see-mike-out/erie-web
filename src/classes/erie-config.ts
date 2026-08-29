import {
  isInstanceOf
} from "./erie-util";
import { deepcopy } from "../util";
import { ConfigInterface } from "../types";

export class Config {
  _config: ConfigInterface = {};
  constructor() {
    this._config = {
      speechRate: 1.75,
      skipScaleSpeech: false,
      skipDescription: false,
      skipTitle: false,
      overlayScaleConsistency: true,
      forceOverlayScaleConsistency: false,
      sequenceScaleConsistency: true,
      forceSequenceScaleConsistency: false
    };
  }

  set(k: keyof ConfigInterface, v: any) {
    if (configValidator(k, v)) {
      this._config[k] = v;
    } else {
      throw TypeError(`Wrong value type for ${k}.`);
    }

    return this;
  }

  get() {
    return deepcopy(this._config);
  }

  clone(): Config {
    let _c = new Config();
    let g = this.get();
    Object.keys(g).forEach((k) => {
      _c.set(k, g[k]);
    });
    return _c;
  }
}

function configValidator(k: keyof ConfigInterface, v: any) {
  if (k === 'speechRate') return isInstanceOf(v, Number) && v > 0;
  else if (k === 'skipScaleSpeech') return isInstanceOf(v, Boolean);
  else if (k === 'skipDescription') return isInstanceOf(v, Boolean);
  else if (k === 'skipTitle') return isInstanceOf(v, Boolean);
  else if (k === 'overlayScaleConsistency') return isInstanceOf(v, Boolean);
  else if (k === 'forceOverlayScaleConsistency') return isInstanceOf(v, Boolean);
  else if (k === 'sequenceScaleConsistency') return isInstanceOf(v, Boolean);
  else if (k === 'forceSequenceScaleConsistency') return isInstanceOf(v, Boolean)
  else return true;
}