// chime instrument -> FM Synth

import { playAbsoluteDiscreteTones } from "../player";
import { AudioPrimitiveBuffer } from "../pulse";
import {
  Glyph,
  Glyphs2
} from "../types";
import {
  Chimes,
  chimeSynth
} from "./audio-graph-chime-defs";

export async function playChime(
  ctx: AudioContext | undefined,
  _chime: Glyph[] | keyof typeof Chimes,
  bufferPrimitve: AudioPrimitiveBuffer | undefined
) {
  if (ctx === undefined) {
    ctx = new AudioContext();
  }
  let chime = typeof _chime === 'string' ? Chimes[_chime] : _chime;
  let chime_queue = chime as Glyphs2;
  chime_queue.hasSpeech = false;
  await playAbsoluteDiscreteTones(
    ctx,
    chime_queue,
    {},
    {}, // sampled
    { chimeSynth }, // synth defs
    {}, // wave defs
    [],
    bufferPrimitve
  );
}