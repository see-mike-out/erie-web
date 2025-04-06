import { AggregateSpec } from "./aggregate";
import { BinSpec } from "./bin";
import { BoxplotSpec } from "./boxplot";
import { CalculateSpec } from "./calculate";
import { DensitySpec } from "./density";
import { FilterSpec } from "./filter";
import { FoldSpec } from "./fold";
import { QuantileSpec } from "./quantile";

// Transform: Generalized
export type TransformItemSpec = AggregateSpec
  | BinSpec
  | CalculateSpec
  | DensitySpec
  | FilterSpec
  | FoldSpec
  | BoxplotSpec
  | QuantileSpec;

export type TransformListSpec = Array<TransformItemSpec>


