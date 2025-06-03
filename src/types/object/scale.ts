import {
  DETUNE_chn,
  DUR_chn,
  HARMONICITY_chn,
  LOUDNESS_chn,
  MODULATION_chn,
  PAN_AZIMUTH_chn,
  PAN_chn,
  PAN_POLAR_chn,
  PAN_RADIUS_chn,
  PAN_X_chn,
  PAN_Y_chn,
  PAN_Z_chn,
  PITCH_chn,
  POST_REVERB_chn,
  REPEAT_chn,
  TAPCNT_chn,
  TAPSPD_chn,
  TIMBRE_chn,
  TIME_chn
} from "./channel";

/*----- ORDERING -----*/
export const ScaleDescriptionOrder = [
  REPEAT_chn,
  TIME_chn,
  TIMBRE_chn,
  DUR_chn,
  TAPCNT_chn,
  TAPSPD_chn,
  PITCH_chn,
  DETUNE_chn,
  LOUDNESS_chn,
  PAN_chn,
  PAN_X_chn,
  PAN_Y_chn,
  PAN_Z_chn,
  PAN_RADIUS_chn,
  PAN_POLAR_chn,
  PAN_AZIMUTH_chn,
  MODULATION_chn,
  HARMONICITY_chn,
  POST_REVERB_chn
], SKIP = 'skip', NONSKIP = 'nonskip', DEF_LEGEND_DUR = 0.5;

export const OmitDesc = ['time2'];
