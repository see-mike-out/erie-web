import {
  isInstanceOf
} from "./erie-util";
import { deepcopy, dropUndefined } from "../util";
import { ConfigInterface, isTimeUnit } from "../types";

export class Config {
  _config: ConfigInterface = {};
  constructor() {
    this._config = {
      // speechRate: 1.75,
      // skipScaleSpeech: false,
      // skipDescription: false,
      // skipTitle: false,
      // skipLength: false,
      // overlayScaleConsistency: true,
      // forceOverlayScaleConsistency: false,
      // sequenceScaleConsistency: true,
      // forceSequenceScaleConsistency: false
    };
  }

  set(k: keyof ConfigInterface, v: any) {
    if (v === undefined) {
      delete this._config[k];
    } else if (configValidator(k, v)) {
      this._config[k] = v;
    } else {
      throw TypeError(`Wrong value type for ${k}.`);
    }

    return this;
  }

  get(k?: keyof ConfigInterface) {
    if (k) {
      return this._config[k];
    } else {
      return dropUndefined(deepcopy(this._config));
    }
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
  else if (['overlayScaleConsistency', 'forceOverlayScaleConsistency', 'sequenceScaleConsistency', 'forceSequenceScaleConsistency'].includes(k as string)) {
    return isInstanceOf(v, Boolean) || (isInstanceOf(v, Object) && Object.values(v).every((d) => typeof d === 'boolean'));
  } else if (k === 'timeUnit') {
    return isTimeUnit(v);
  }
  else return true;
}