// Transform: Density
export interface DensitySpec {
  /**
   * field name to compute density
   */
  density: string;
  /**
   * the range of density calculation
   */
  extent?: number[];
  /**
   * group the resulting densities by a field(s)
   */
  groupby?: string[];
  /**
   * whether to make cumulative density
   */
  cumulative?: boolean;
  /**
   * whether to compute density as count
   */
  counts?: boolean;
  /**
   * kernel bandwidth
   */
  bandwidth?: number;
  /**
   * the minimum number of sampled values
   */
  minsteps?: number;
  /**
   * the maximum number of sampled values
   */
  maxsteps?: number;
  /**
   * the exact number of sampled values
   */
  steps?: number;
  /**
   * the resulting field name
   */
  as?: [string, string];
}
