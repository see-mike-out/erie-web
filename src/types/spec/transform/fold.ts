// Transform: Fold
export interface FoldSpec {
  /**
   * field(s) to fold
   */
  fold: string[];
  /**
   * the field name to fold by
   */
  by: string;
  /**
   * whether to drop (true) other fields (default:false)
   */
  exclude?: boolean;
  /**
   * new field names for the folded variables ([key, name] order)
   */
  as?: [string, string];
}