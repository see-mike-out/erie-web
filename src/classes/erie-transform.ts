import { TransformList } from "../types/transform";
import { Aggregate } from "./erie-transform-aggregate";
import { Bin } from "./erie-transform-bin";
import { Calculate } from "./erie-transform-calculate";
import { Density } from "./erie-transform-density";
import { Filter } from "./erie-transform-filter";
import { Fold } from "./erie-transform-fold";

export class Transform {
  transform: Array<Aggregate | Bin | Calculate | Density | Filter | Fold>
  constructor() {
    this.transform = [];
  }
  add(tf: Aggregate | Bin | Calculate | Density | Filter | Fold) {
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