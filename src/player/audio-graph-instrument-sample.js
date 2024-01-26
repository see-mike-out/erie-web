export const SupportedInstruments = ["piano", "pianoElec", "violin", "metal", "guitar", "hithat", "snare", "highKick", "lowKick", "clap"];
export const MultiNoteInstruments = ["piano", "pianoElec", "violin", "metal", "guitar"];
export const SingleNoteInstruments = ["hithat", "snare", "highKick", "lowKick", "clap"];
// below is for detuning
export const noteFreqRange = [
  {
    octave: 0,
    c: 16.35,
    cs: 17.32,
    d: 18.35,
    ds: 19.45,
    e: 20.6,
    f: 21.83,
    fs: 23.12
  },
  {
    octave: 1,
    gf: 23.12,
    g: 24.5,
    af: 25.96,
    a: 27.5,
    bf: 29.14,
    b: 30.87,
    c: 32.7,
    cs: 34.65,
    d: 36.71,
    ds: 38.89,
    e: 41.2,
    f: 43.65,
    fs: 46.25
  },
  {
    octave: 2,
    gf: 46.25,
    g: 49,
    af: 51.91,
    a: 55,
    bf: 58.27,
    b: 61.74,
    c: 65.41,
    cs: 69.3,
    d: 73.42,
    ds: 77.78,
    e: 82.41,
    f: 87.31,
    fs: 92.5
  },
  {
    octave: 3,
    gf: 92.5,
    g: 98,
    af: 103.83,
    a: 110,
    bf: 116.54,
    b: 123.47,
    c: 130.81,
    cs: 138.59,
    d: 146.83,
    ds: 155.56,
    e: 164.81,
    f: 174.61,
    fs: 185
  },
  {
    octave: 4,
    gf: 185,
    g: 196,
    af: 207.65,
    a: 220,
    bf: 233.08,
    b: 246.94,
    c: 261.63,
    cs: 277.18,
    d: 293.66,
    ds: 311.13,
    e: 329.63,
    f: 349.23,
    fs: 369.99
  },
  {
    octave: 5,
    gf: 369.99,
    g: 392,
    af: 415.3,
    a: 440,
    bf: 466.16,
    b: 493.88,
    c: 523.25,
    cs: 554.37,
    d: 587.33,
    ds: 622.25,
    e: 659.25,
    f: 698.46,
    fs: 739.99
  },
  {
    octave: 6,
    gf: 739.99,
    g: 783.99,
    af: 830.61,
    a: 880,
    bf: 932.33,
    b: 987.77,
    c: 1046.5,
    cs: 1108.73,
    d: 1174.66,
    ds: 1244.51,
    e: 1318.51,
    f: 1396.91,
    fs: 1479.98
  },
  {
    octave: 7,
    gf: 1479.98,
    g: 1567.98,
    af: 1661.22,
    a: 1760,
    bf: 1864.66,
    b: 1975.53,
    c: 2093,
    cs: 2217.46,
    d: 2349.32,
    ds: 2489.02,
    e: 2637.02,
    f: 2793.83,
    fs: 2959.96
  }
];
export const noteScaleOrder = ['gf', 'g', 'af', 'a', 'bf', 'b', 'c', 'cs', 'd', 'ds', 'e', 'f', 'fs'];
export const detuneAmmount = {
  gf: -600,
  g: -500,
  af: -400,
  a: -300,
  bf: -200,
  b: -100,
  c: 0,
  cs: 100,
  d: 200,
  ds: 300,
  e: 400,
  f: 500,
  fs: 600
};

export function roundToNote(freq, scales) {
  let min_diff = 5000,
    min_diff_note;
  for (const noteName of noteScaleOrder) {
    let diff = Math.abs(scales[noteName] - freq);
    if (diff < min_diff) {
      min_diff = diff;
      min_diff_note = noteName;
    }
  }
  return {
    note_name: min_diff_note,
    prev_note: noteScaleOrder[noteScaleOrder.indexOf(min_diff_note) - 1],
    next_note: noteScaleOrder[noteScaleOrder.indexOf(min_diff_note) + 1],
    note_freq: scales[min_diff_note],
    detune: detuneAmmount[min_diff_note]
  };
}

export function roundToNoteScale(freq) {
  let octave;
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
    return roundToNote(freq, octave).note_freq;
  } else {
    console.warn(
      'Frequence out of scope. Max possible frequency is 2959.96 and min possible frequency is 16.35.'
    );
    return null;
  }
}

export function determineNoteRange(freq, config) {
  let octave;
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
        octave: octave.octave,
        original_freq: freq,
        freq: rounded_note.note_freq,
        note: rounded_note.note_name,
        detune: rounded_note.detune
      };
    } else {
      let detune_base = rounded_note.detune;
      let note_diff = rounded_note.note_freq - freq;
      let detune = 0;
      if (note_diff < 0) {
        let note_left = octave[rounded_note.prev_note];
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
        let note_right = octave[rounded_note.next_note];
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
      return { octave: octave.octave, freq, detune };
    }
  } else {
    console.warn(
      'Frequence out of scope. Max possible frequency is 2959.96 and min possible frequency is 16.35.'
    );
    return null;
  }
}

export async function loadSamples(ctx, instrument_name, smaplingDef, baseUrl) {
  let samples = {};
  if (MultiNoteInstruments.includes(instrument_name)) {
    for (const octave of noteFreqRange) {
      let sampleRes = await fetch(`${baseUrl || ''}audio_sample/${instrument_name}_c${octave.octave}.mp3`);
      let sampleBuffer = await sampleRes.arrayBuffer();
      let source = await ctx.decodeAudioData(sampleBuffer)
      samples[`C${octave.octave}`] = source;
    }
    samples.multiNote = true;
  } else if (SingleNoteInstruments.includes(instrument_name)) {
    samples = await makeSingleScaleSamplingNode(ctx, `${baseUrl || ''}audio_sample/${instrument_name}.mp3`);
    samples.multiNote = false;
  } else if (smaplingDef[instrument_name]) {
    if (smaplingDef[instrument_name].sample?.mono) {
      // single
      try {
        samples = await makeSingleScaleSamplingNode(ctx, smaplingDef[instrument_name].sample.mono);
        samples.multiNote = false;
      } catch (e) {
        console.error(e);
      }
    } else {
      // multi
      try {
        samples = await makeMultiScaleSamplingNode(ctx, smaplingDef[instrument_name].sample);
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

export async function makeMultiScaleSamplingNode(ctx, def) {
  let samples = {}, keys = Object.keys(def);
  if (!keys.every(scaleKeyCheck)) {
    console.error("A sampling note must be 'C' in octave 0 to 7");
  }
  for (const key of keys) {
    let sampleRes = await fetch(def[key]);
    let sampleBuffer = await sampleRes.arrayBuffer();
    let source = await ctx.decodeAudioData(sampleBuffer)
    samples[key] = source;
  }
  return samples;
}

export async function makeSingleScaleSamplingNode(ctx, def) {
  let samples = {};
  let sampleRes = await fetch(def);
  let sampleBuffer = await sampleRes.arrayBuffer();
  let source = await ctx.decodeAudioData(sampleBuffer)
  samples.mono = source;
  return samples;
}

function scaleKeyCheck(key) {
  return key.match(/^[C][0-7]$/);
}