import { Aggregate } from "./erie-transform-aggregate";
import { Bin } from "./erie-transform-bin";
import { Calculate } from "./erie-transform-calculate";
import { Density } from "./erie-transform-density";
import { Filter } from "./erie-transform-filter";
import { Fold } from "./erie-transform-fold";
import { isInstanceOf } from "./erie-util";

const SupportedTransforms = [
  Aggregate.name,
  Bin.name,
  Calculate.name,
  Density.name,
  Filter.name,
  Fold.name,
]

export class Transform {
  constructor() {
    this.transform = [];
  }
  add(tf) {
    if (isInstanceOf(tf, Aggregate) ||
      isInstanceOf(tf, Bin) ||
      isInstanceOf(tf, Filter) ||
      isInstanceOf(tf, Calculate) ||
      isInstanceOf(tf, Density) ||
      isInstanceOf(tf, Fold)) {
      this.transform.push(tf);
    } else {
      throw new TypeError(`A transform item must be created using a proper Erie's Transform classes: ${SupportedTransforms.join(", ")}.`);
    }

    return this;
  }

  get() {
    return this.transform.map((tf) => tf.get());
  }

  clone() {
    let c = new Transform();
    this.transform.forEach((tf) => c.add(tf.clone()));
    return c;
  }
}