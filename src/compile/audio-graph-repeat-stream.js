import {
  SEQUENCE, OVERLAY
} from "../scale/audio-graph-scale-constant";
import { jType } from "../util/audio-graph-typing-util";
import { OverlayStream, UnitStream } from "./audio-graph-datatype";

export function makeRepeatStreamTree(level, values, directions) {
  let tree = {};
  if (level === undefined) level = 0;
  if (directions.length <= level) return { direction: 'leaf', node: [] };
  let memberships = values.map((v) => v.membership[level]);
  let curr_value_list = [];
  let dir = directions[level];
  tree.direction = dir;
  tree.nodes = [];
  tree.field = memberships[0].key;
  let membership_checked = [];
  for (const member of memberships) {
    if (!membership_checked.includes(member.value)) {
      membership_checked.push(member.value);
      if (!curr_value_list.includes(member.value)) {
        let subValues = values.filter((d) => d[level] === member.value);
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

export function postprocessRepeatStreams(tree) {
  let flat_streams = postprocessRstreamTree(tree);
  flat_streams = flat_streams.nodes.map((s) => {
    if (jType(s) === UnitStream.name) return s;
    else if (s.length == 1) return s[0];
    else if (s.length > 1) {
      let overlay = new OverlayStream();
      overlay.addStreams(s);
      return overlay;
    }
  });
  return flat_streams;
}

function postprocessRstreamTree(tree) {
  if (tree.direction === 'leaf') return { nodes: tree.node, dir: 'leaf' };
  else {
    if (tree.direction === OVERLAY) {
      let flat_overlay = [];
      tree.nodes.forEach((node) => {
        let { nodes, dir } = postprocessRstreamTree(node);
        flat_overlay.push(...nodes);
      });
      return { nodes: flat_overlay.filter(d => d !== undefined), dir: OVERLAY };
    } else if (tree.direction === SEQUENCE) {
      let flat_seq = [];
      tree.nodes.forEach((node) => {
        let { nodes, dir } = postprocessRstreamTree(node);
        if (dir === OVERLAY) {
          flat_seq.push(nodes);
        } else {
          flat_seq.push(...nodes);
        }
      });
      return { nodes: flat_seq.filter(d => d !== undefined), dir: SEQUENCE };
    }
  }
}