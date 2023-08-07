import { noteToFreq } from "../util/audio-graph-scale-util";
import { DUR_chn, LOUDNESS_chn, PAN_chn, PITCH_chn, POST_REVERB_chn, TAPCNT_chn, TAPSPD_chn, TIMBRE_chn, TIME_chn } from "./audio-graph-scale-constant";

export const QuantPreferredRange = {
  [TIME_chn]: [0, 5],
  [PITCH_chn]: [200, 1000],
  [LOUDNESS_chn]: [0, 1],
  [PAN_chn]: [-1, 1],
  [DUR_chn]: [0, 1.5],
  [POST_REVERB_chn]: [0, 2],
  [TAPCNT_chn]: [0, 20],
  [TAPSPD_chn]: [0, 5]
};

export const NomPalletes = {
  [PITCH_chn]: [
    'C3', 'C4', 'C5', 'C6',
    'G3', 'G4', 'G5', 'G6',
    'D3', 'D4', 'D5', 'D6',
    'A3', 'A4', 'A5', 'A6',
    'E3', 'E4', 'E5', 'E6',
    'B3', 'B4', 'B5', 'B6',
    'F3', 'F4', 'F5', 'F6'].map(noteToFreq),
  [LOUDNESS_chn]: [
    1, 0.8, 0.6, 0.4, 0.2, 0.9, 0.7, 0.5, 0.1
  ],
  [DUR_chn]: [1, 0.5, 1.5, 2, 1.3, 0.8, 0.3],
  [POST_REVERB_chn]: [1, 0.5, 1.5, 2, 1.3, 0.8, 0.3],
  [TAPCNT_chn]: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
  [TAPSPD_chn]: [1, 2, 3, 4],
  [TIMBRE_chn]: ["piano", "pianoElec", "violin", "metal", "guitar", "hithat", "snare", "highKick", "lowKick", "clap"]
}

export function repeatPallete(pallete, len) {
  let pLen = pallete?.length;
  if (pLen >= len) {
    return pallete.slice(0, len);
  } else {
    let repeats = Math.floor(pLen / len);
    let remains = len - repeats * pLen;
    let output = [];
    for (let i = 0; i < repeats; i++) {
      output.push(...pallete);
    }
    output.push(...pallete.slice(0, remains));
    return output;
  }
}