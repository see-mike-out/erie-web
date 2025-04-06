// chime instrument -> FM Synth

import { playAbsoluteDiscreteTones } from "../player";
import { AudioPrimitiveBuffer } from "../pulse";
import { Glyph, Glyphs2, InstrumentNode } from "../types";
import { chimeSynth } from "./audio-graph-chime-defs";

export async function playChime(
  ctx: AudioContext,
  chime: Glyph[],
  inst: InstrumentNode,
  bufferPrimitve: AudioPrimitiveBuffer | undefined
) {
  let chiime_queue = chime as Glyphs2;
  chiime_queue.hasSpeech = false;
  await playAbsoluteDiscreteTones(
    ctx,
    chiime_queue,
    {},
    {},
    { chimeSynth },
    {},
    [],
    bufferPrimitve
  )
}