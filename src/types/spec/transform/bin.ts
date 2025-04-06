// Transform: Bin
export interface BinSpec {
  /**
   * field name to bin
   */
  bin: string,
  /**
   * new field name for the start point
   */
  as?: string,
  /**
   * new field name for the end point
   */
  end?: string,
  /**
   * nice bin buckets
   */
  nice?: boolean,
  /**
   * the max number of bins
   */
  maxbins?: number,
  /**
   * exact bin steps
   */
  step?: number,
  /**
   * exact bin buckets (should alway include the beggining and the end point)
   */
  exact?: number[],
  /**
   * reserved for rendering purposes (won't do anything when provided via spec)
   */
  auto?: boolean
}
/** Inline transforms */

// Inline: Bin
interface InlineBin1 {
  /**
   * the number of maximum bins
   */
  maxbins?: number,
  /**
   * whether to use "nice" buckets
   */
  nice?: boolean,
  /**
   * the exact steps
   */
  step?: number
}
interface InlineBin2 {
  /**
   * the exact bucketes
   */
  exact: number[]
}

// inline bin can be specified as true/false.
export type InlineBinType = boolean | InlineBin1 | InlineBin2;
