import { TransformList } from "../types";
import { Aggregate } from "./erie-transform-aggregate";
import { Bin } from "./erie-transform-bin";
import { Boxplot } from "./erie-transform-boxplot";
import { Calculate } from "./erie-transform-calculate";
import { Density } from "./erie-transform-density";
import { Diffing } from "./erie-transform-diffing";
import { Filter } from "./erie-transform-filter";
import { Fold } from "./erie-transform-fold";
import { Quantile } from "./erie-transform-quantile";

export class Transform {
  transform: Array<Aggregate | Bin | Calculate | Density | Filter | Fold | Boxplot | Quantile | Diffing>
  constructor() {
    this.transform = [];
  }
  add(tf: Aggregate | Bin | Calculate | Density | Filter | Fold | Boxplot | Quantile | Diffing) {
    this.transform.push(tf);
    return this;
  }

  get(): TransformList {
    return this.transform.map((tf) => tf.get());
  }

  clone(): Transform {
    let c = new Transform();
    this.transform.forEach((tf) => c.add(tf.clone()));
    return c;
  }
}