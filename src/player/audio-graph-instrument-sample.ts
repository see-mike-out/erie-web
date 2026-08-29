import {
  ConfigInterface,
  detuneAmmount,
  LoadedMonoSample,
  LoadedMultiSample,
  LoadedSample,
  MultiNoteInstruments,
  noteFreqRange,
  noteScaleOrder,
  OctaveDefinition,
  OctaveKey,
  RecordObject,
  RoundedNote,
  SamplingItem,
  SingleNoteInstruments,
  NoteRange,
  OctaveValue,
  NoteValue,
  HashedObject,
  SampledToneNormed
} from "../types";

export function roundToNote(
  freq: number,
  scales: OctaveDefinition
): RoundedNote {
  let min_diff = 5000,
    min_diff_note!: string;
  for (const noteName of noteScaleOrder) {
    let diff = Math.abs(scales[noteName as keyof OctaveDefinition] - freq);
    if (diff < min_diff) {
      min_diff = diff;
      min_diff_note = noteName;
    }
  }
  return {
    note_name: min_diff_note,
    prev_note: noteScaleOrder[noteScaleOrder.indexOf(min_diff_note) - 1],
    next_note: noteScaleOrder[noteScaleOrder.indexOf(min_diff_note) + 1],
    note_freq: scales[min_diff_note as keyof OctaveDefinition],
    detune: detuneAmmount[min_diff_note as keyof typeof detuneAmmount]
  };
}

export function roundToNoteScale(freq: number): number | null {
  let octave!: OctaveDefinition;
  for (const range of noteFreqRange) {
    if (range.octave == 0 && range.c <= freq && freq < range.fs) {
      octave = range;
    } else if (range.octave == 7 && range.gf <= freq && freq <= range.fs) {
      octave = range;
    } else if (range.gf <= freq && freq < range.fs) {
      octave = range;
    }
  }
  if (octave !== undefined) {
    return roundToNote(freq, octave)?.note_freq;
  } else {
    console.warn(
      'Frequence out of scope. Max possible frequency is 2959.96 and min possible frequency is 16.35.'
    );
    return null;
  }
}

export function determineNoteRange(freq: number, config: ConfigInterface): NoteRange | null {
  let octave!: OctaveDefinition;
  for (const range of noteFreqRange) {
    if (range.octave == 0 && range.c <= freq && freq < range.fs) {
      octave = range;
    } else if (range.octave == 7 && range.gf <= freq && freq <= range.fs) {
      octave = range;
    } else if (range.gf <= freq && freq < range.fs) {
      octave = range;
    }
  }
  if (octave !== undefined) {
    let rounded_note = roundToNote(freq, octave);
    if (config?.round) {
      return {
        octave: octave.octave as OctaveValue,
        original_freq: freq,
        freq: rounded_note.note_freq,
        note: rounded_note.note_name as NoteValue,
        detune: rounded_note.detune
      };
    } else {
      let detune_base = rounded_note.detune;
      let note_diff = rounded_note.note_freq - freq;
      let detune = 0;
      if (note_diff < 0) {
        let note_left = octave[rounded_note.prev_note as keyof OctaveDefinition];
        if (!rounded_note.prev_note) {
          note_left = noteFreqRange[octave.octave - 1]?.f;
        }
        detune =
          Math.round(-100 * Math.abs(note_diff / (note_left - rounded_note.note_freq))) +
          detune_base;
        if (!note_left) {
          detune = detune_base;
        }
      } else if (note_diff > 0) {
        let note_right = octave[rounded_note.next_note as keyof OctaveDefinition];
        if (!rounded_note.next_note) {
          note_right = noteFreqRange[octave.octave + 1]?.g;
        }
        detune =
          Math.round(100 * Math.abs(note_diff / (note_right - rounded_note.note_freq))) +
          detune_base;
        if (!note_right) {
          detune = detune_base;
        }
      } else {
        detune = detune_base;
      }
      return { octave: octave.octave as OctaveValue, freq, detune };
    }
  } else {
    console.warn(
      'Frequence out of scope. Max possible frequency is 2959.96 and min possible frequency is 16.35.'
    );
    return null;
  }
}

export async function loadSamples(
  ctx: AudioContext,
  instrument_name: string,
  smaplingDef: HashedObject<SampledToneNormed>,
  baseUrl: string
): Promise<LoadedSample> {
  let samples!: LoadedSample;
  if (MultiNoteInstruments.includes(instrument_name)) {
    samples = { multiNote: true } as LoadedMultiSample;
    for (const octave of noteFreqRange) {
      let sampleRes = await fetch(`${baseUrl || ''}audio_sample/${instrument_name}_c${octave.octave}.mp3`);
      let sampleBuffer = await sampleRes.arrayBuffer();
      let source = await ctx.decodeAudioData(sampleBuffer)
      samples[`C${octave.octave}` as OctaveKey] = source;
    }
  } else if (SingleNoteInstruments.includes(instrument_name)) {
    samples = await makeSingleScaleSamplingNode(ctx, `${baseUrl || ''}audio_sample/${instrument_name}.mp3`);
  } else if (smaplingDef[instrument_name]) {
    if (smaplingDef[instrument_name].sample?.mono) {
      // single
      try {
        samples = await makeSingleScaleSamplingNode(ctx, smaplingDef[instrument_name].sample.mono, `${baseUrl || ''}`);
      } catch (e) {
        console.error(e);
      }
    } else {
      // multi
      try {
        samples = await makeMultiScaleSamplingNode(ctx, smaplingDef[instrument_name].sample, `${baseUrl || ''}`);
        samples.multiNote = true;
      } catch (e) {
        console.error(e);
      }
    }
  } else {
    console.warn(`The instrument "${instrument_name}" is not supported or sampled.`)
  }
  return samples;
}

export async function makeMultiScaleSamplingNode(
  ctx: AudioContext,
  def: SamplingItem,
  base?: string
): Promise<LoadedMultiSample> {
  let samples: RecordObject = { multiNote: true },
    keys = Object.keys(def) as Array<keyof SamplingItem>;
  if (!keys.every(scaleKeyCheck)) {
    console.error("A sampling note must be 'C' in octave 0 to 7");
  }
  for (const key of keys) {
    if (def[key]) {
      let sampleRes = await fetch((base ?? "") + def[key]);
      let sampleBuffer = await sampleRes.arrayBuffer();
      let source = await ctx.decodeAudioData(sampleBuffer)
      samples[key as OctaveKey] = source;
    }
  }
  return samples as LoadedMultiSample;
}

export async function makeSingleScaleSamplingNode(
  ctx: AudioContext,
  def: string,
  base?: string
): Promise<LoadedMonoSample> {
  let sampleRes = await fetch((base ?? "") + def);
  let sampleBuffer = await sampleRes.arrayBuffer();
  let source = await ctx.decodeAudioData(sampleBuffer)
  return {
    mono: source,
    multiNote: false
  };
}

function scaleKeyCheck(key: string) {
  return key.match(/^[C][0-7]$/);
}