import { UnitStream } from "../../compile";
import { OVERLAY, SEQUENCE } from "../object";
import { Glyph } from "./glyph";

// repeat tree after parsing

export type RepeatTreeNonLeaf = {
  direction: typeof OVERLAY | typeof SEQUENCE;
  nodes: RepeatTree[];
  field: string | string[];
  parent_value?: any;
};

export type RepeatTreeLeaf = {
  parent_value?: any;
  direction: 'leaf';
  field?: string | string[];
  nodes: UnitStream[];
}

export type RepeatTree = RepeatTreeNonLeaf | RepeatTreeLeaf;

export type RepeatTreePost = {
  dir: typeof OVERLAY | typeof SEQUENCE | 'leaf';
  nodes: Array<UnitStream | UnitStream[]>;
}

export type MembershipMarker = {
  key: string,
  value: any
}

export type RepeatGraphItem = {
  name: string,
  membership: MembershipMarker[],
  glyphs: Glyph[]
}
export type RepeatMembershipItem = {
  value_keys: string[],
  membership: MembershipMarker[]
}