import {
  Glyph,
  noteFreqRange,
  SynthNormed
} from "../types";

const ChimeBeat = 0.33;
export function getChimeBeat(n: number) {
  return ChimeBeat * n;
}

export const ChimeBeforePlay: Glyph[] = [{
  start: getChimeBeat(0), duration: getChimeBeat(1), pitch: noteFreqRange[5].c, loudness: 1, timbre: 'chimeSynth'
}, {
  start: getChimeBeat(1), duration: getChimeBeat(1), pitch: noteFreqRange[6].g, loudness: 1, timbre: 'chimeSynth'
}, {
  start: getChimeBeat(2), duration: getChimeBeat(0.15), pitch: noteFreqRange[0].c, loudness: 0, timbre: 'chimeSynth'
}]; // C -> G

export const ChimeNext: Glyph[] = [{
  start: getChimeBeat(0.15), duration: getChimeBeat(1.5), pitch: noteFreqRange[6].c, loudness: 1, timbre: 'chimeSynth'
}, {
  start: getChimeBeat(1.65), duration: getChimeBeat(1), pitch: noteFreqRange[6].c, loudness: 1, timbre: 'chimeSynth'
}, {
  start: getChimeBeat(2.65), duration: getChimeBeat(0.15), pitch: noteFreqRange[0].c, loudness: 0, timbre: 'chimeSynth'
}]; // C -> C

export const ChimeAfterPlay: Glyph[] = [{
  start: getChimeBeat(0.15), duration: getChimeBeat(1), pitch: noteFreqRange[6].g, loudness: 1, timbre: 'chimeSynth'
}, {
  start: getChimeBeat(1.15), duration: getChimeBeat(1), pitch: noteFreqRange[5].c, loudness: 1, timbre: 'chimeSynth'
}]; // G -> C

export const ChimeIncoming: Glyph[] = [{
  start: getChimeBeat(0), duration: getChimeBeat(1), pitch: noteFreqRange[5].c, loudness: 1, timbre: 'chimeSynth'
}, {
  start: getChimeBeat(1), duration: getChimeBeat(1), pitch: noteFreqRange[6].g, loudness: 1, timbre: 'chimeSynth'
}, {
  start: getChimeBeat(1.5), duration: getChimeBeat(1), pitch: noteFreqRange[5].e, loudness: 1, timbre: 'chimeSynth'
}, {
  start: getChimeBeat(2), duration: getChimeBeat(1), pitch: noteFreqRange[5].c, loudness: 1, timbre: 'chimeSynth'
}, {
  start: getChimeBeat(3), duration: getChimeBeat(0.15), pitch: noteFreqRange[0].c, loudness: 0, timbre: 'chimeSynth'
}]; // C -> G -> E -> C

export const ChimeBeforePlayback: Glyph[] = [{
  start: getChimeBeat(0), duration: getChimeBeat(1), pitch: noteFreqRange[3].d, loudness: 1, timbre: 'chimeSynth'
}, {
  start: getChimeBeat(1), duration: getChimeBeat(1), pitch: noteFreqRange[4].g, loudness: 1, timbre: 'chimeSynth'
}, {
  start: getChimeBeat(2), duration: getChimeBeat(0.15), pitch: noteFreqRange[0].c, loudness: 0, timbre: 'chimeSynth'
}]; // D -> G (low octave)

export const ChimeAfterPlayback: Glyph[] = [{
  start: getChimeBeat(0), duration: getChimeBeat(1), pitch: noteFreqRange[4].g, loudness: 1, timbre: 'chimeSynth'
}, {
  start: getChimeBeat(1), duration: getChimeBeat(1), pitch: noteFreqRange[3].d, loudness: 1, timbre: 'chimeSynth'
}, {
  start: getChimeBeat(2), duration: getChimeBeat(0.15), pitch: noteFreqRange[0].c, loudness: 0, timbre: 'chimeSynth'
}]; // G -> D


export const chimeSynth: SynthNormed = {
  name: 'chimeSynth',
  type: 'FM',
  carrierType: 'sine',
  carrierPitch: 220,
  carrierDetune: 0,
  carrierVolume: 1,
  modulatorType: 'sine',
  modulatorPitch: 440,
  modulatorVolume: 1,
  modulation: 1,
  harmonicity: 1,
  attackTime: 0.05,
  releaseTime: 0.05,
  sustain: 0.2,
  decayTime: 0
}

export const Chimes = {
  'beforePlay': ChimeBeforePlay,
  'afterPlay': ChimeAfterPlay,
  'beforePlayback': ChimeBeforePlayback,
  'afterPlayback': ChimeAfterPlayback,
  'incoming': ChimeIncoming,
  'next': ChimeNext
}