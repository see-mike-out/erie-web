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
  player_id: string,
  ctx: AudioContext | undefined,
  _chime: Glyph[] | keyof typeof Chimes,
  bufferPrimitve: AudioPrimitiveBuffer | undefined
) {
  let close_ctx = false;
  if (ctx === undefined) {
    ctx = new AudioContext();
    close_ctx = true;
  }
  let chime = typeof _chime === 'string' ? Chimes[_chime] : _chime;
  let chime_queue = chime as Glyphs2;
  chime_queue.hasSpeech = false;
  await playAbsoluteDiscreteTones(
    player_id,
    ctx,
    chime_queue,
    {},
    {}, // sampled
    { chimeSynth }, // synth defs
    {}, // wave defs
    [],
    bufferPrimitve
  );
  if (close_ctx) {
    ctx.close();
  }
}