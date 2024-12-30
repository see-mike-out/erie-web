import { determineNoteRange } from './audio-graph-instrument-sample';
import { makeSynth } from './audio-graph-synth';
import {
  makeNoiseNode,
  NoiseTypes
} from './audio-graph-noise';
import {
  SampleRate,
  BufferChannels,
  DefaultFrequency,
  MultiNoteInstruments,
  SingleNoteInstruments,
  InstrumentNode,
  isOscType,
  LoadedSampleCollection,
  HashedSynthObject,
  HashedWaveObject,
  Glyph,
  LoadedMultiSample,
  OctaveKey,
  NoteRange,
  LoadedMonoSample,
} from '../types';

export function makeContext() {
  return new AudioContext();
}

export function makeOfflineContext(length: number) {
  return new OfflineAudioContext(BufferChannels, SampleRate * length, SampleRate);
}

export function makeInstrument(
  ctx: AudioContext | OfflineAudioContext,
  iType?: string | undefined | null,
  instSamples?: LoadedSampleCollection,
  synthDefs?: HashedSynthObject,
  waveDefs?: HashedWaveObject,
  sound?: Glyph,
  contEndTime?: number
): InstrumentNode {
  if (iType === "default") {
    return ctx.createOscillator();
  } else if (isOscType(iType)) {
    let osc = ctx.createOscillator();
    osc.type = iType;
    return osc;
  } else if (typeof iType === 'string' && NoiseTypes.includes(iType)) {
    let dur = contEndTime ?? sound?.duration ?? 0;
    if (sound && 'detune' in sound && sound?.detune !== undefined && sound?.detune > 0) dur += dur * (sound?.detune / 600);
    return makeNoiseNode(ctx, iType, dur * 1.1);
  } else if (typeof iType === 'string' && MultiNoteInstruments.includes(iType)) {
    let note = determineNoteRange(sound?.pitch ?? DefaultFrequency, {}) as NoteRange;
    let sample: AudioBuffer = (instSamples?.[iType] as LoadedMultiSample)?.[('C' + note.octave) as OctaveKey];
    let source = ctx.createBufferSource();
    source.buffer = sample;
    source.detune.value = note.detune;
    return source;
  } else if (typeof iType === 'string' && SingleNoteInstruments.includes(iType) && instSamples) {
    let sample = (instSamples[iType] as LoadedMonoSample).mono;
    let source = ctx.createBufferSource();
    source.buffer = sample;
    return source;
  } else if (typeof iType === 'string' && Object.keys(waveDefs || {})?.includes(iType) && waveDefs) {
    let real_parsed = new Float32Array(waveDefs[iType].real);
    let imag_parsed = new Float32Array(waveDefs[iType].imag);
    const wave = ctx.createPeriodicWave(
      real_parsed,
      imag_parsed,
      { disableNormalization: waveDefs[iType].disableNormalization || false });
    let osc = ctx.createOscillator();
    osc.setPeriodicWave(wave);
    return osc;
  } else if (typeof iType === 'string' && Object.keys(instSamples || {})?.includes(iType) && instSamples) {
    let sample: AudioBuffer;
    let note = determineNoteRange(sound?.pitch ?? DefaultFrequency, {}) as NoteRange;
    if (instSamples[iType].multiNote) {
      sample = (instSamples?.[iType] as LoadedMultiSample)?.[('C' + note.octave) as OctaveKey];
    } else {
      sample = instSamples[iType].mono;
    }
    let source = ctx.createBufferSource();
    source.buffer = sample;
    if (instSamples[iType].multiNote) {
      source.detune.value = note.detune;
    }
    return source;
  } else if (typeof iType === 'string' && Object.keys(synthDefs || {})?.includes(iType) && synthDefs) {
    let synth = makeSynth(ctx, synthDefs[iType]);
    return synth;
  } else {
    return ctx.createOscillator();
  }
}