import { OverlayStream } from "./audio-graph-overlay-stream";
import {
  isUnitStreamObject,
  UnitStream
} from "./audio-graph-unit-stream";

import {
  SEQUENCE,
  OVERLAY,
  RepeatMembershipItem,
  RepeatTree,
  RepeatTreeLeaf,
  RepeatTreeNonLeaf,
  RepeatTreePost
} from "../types"


export function makeRepeatStreamTree(
  level: number,
  values: RepeatMembershipItem[],
  directions: Array<typeof SEQUENCE | typeof OVERLAY>
): RepeatTree {
  if (level === undefined) level = 0;
  if (directions.length <= level) return { direction: 'leaf', nodes: [] } as RepeatTreeLeaf;
  let memberships = values.map((v) => v.membership[level]);
  let curr_value_list: any[] = [];
  let dir = directions[level];
  let direction = dir;
  let nodes: RepeatTree[] = [];
  let tree: RepeatTreeNonLeaf = {
    direction,
    field: memberships[0].key,
    nodes
  };
  let membership_checked: any[] = [];
  for (const member of memberships) {
    if (!membership_checked.includes(member.value)) {
      membership_checked.push(member.value);
      if (!curr_value_list.includes(member.value)) {
        let subValues = values.filter((d) => d.value_keys[level] === member.value);
        if (subValues.length > 0) {
          let subtree = makeRepeatStreamTree(level + 1, subValues, directions);
          subtree.parent_value = member.value;
          tree.nodes.push(subtree);
          curr_value_list.push(member.value);
        }
      }
    }
  }
  return tree;
}

export function postprocessRepeatStreams(
  tree: RepeatTree,
  id: string
): Array<UnitStream | OverlayStream> {
  let flat_streams: RepeatTreePost = postprocessRstreamTree(tree);
  return flat_streams.nodes.map((s, i) => {
    if (isUnitStreamObject(s)) return s;
    else if (s instanceof Array && s.length == 1) return s[0];
    else if (s instanceof Array && s.length > 1) {
      let overlay = new OverlayStream(id + "-repeat-" + i);
      overlay.addStreams(s);
      return overlay;
    } else return undefined;
  }).filter((d: any) => d !== undefined) as Array<UnitStream | OverlayStream>;
}

function postprocessRstreamTree(tree: RepeatTree): RepeatTreePost {
  if (tree.direction === 'leaf') return { nodes: tree.nodes, dir: 'leaf' };
  else if (tree.direction === OVERLAY) {
    let flat_overlay: UnitStream[] = [];
    tree.nodes.forEach((node) => {
      let { nodes, dir } = postprocessRstreamTree(node);
      flat_overlay.push(...(nodes as UnitStream[]));
    });
    return { nodes: [flat_overlay.filter(d => d !== undefined)], dir: OVERLAY };
  } else { // tree.direction === SEQUENCE
    let flat_seq: Array<UnitStream | UnitStream[]> = [];
    tree.nodes.forEach((node) => {
      let { nodes, dir } = postprocessRstreamTree(node);
      if (dir === OVERLAY) {
        flat_seq.push(nodes as UnitStream[]);
      } else {
        flat_seq.push(...(nodes as UnitStream[]));
      }
    });
    return { nodes: flat_seq.filter(d => d !== undefined), dir: SEQUENCE };
  }

}