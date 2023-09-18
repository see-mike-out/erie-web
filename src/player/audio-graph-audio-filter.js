import { AllpassBiquadFilter, BandpassBiquadFilter, BiquadEncoder, BiquadFinisher, HighpassBiquadFilter, HighshelfBiquadFilter, LowpassBiquadFilter, LowshelfBiquadFilter, NotchBiquadFilter, PeakingBiquadFilter } from "../audioFilters/audio-graph-filter-biquad";
import { CompressorEncoder, CompressorFinisher, DefaultDynamicCompressor } from "../audioFilters/audio-graph-filter-compressor";
import { DistortionEncoder, DistortionFilter, DistortionFinisher } from "../audioFilters/audio-graph-filter-distortion";
import { GainerFilter, GainerEncoder, GainerFinisher } from "../audioFilters/audio-graph-filter-gainer";
import { DETUNE_chn, LOUDNESS_chn, PITCH_chn } from "../scale/audio-graph-scale-constant";

export const PresetFilters = {
  'gainer': { filter: GainerFilter, encoder: GainerEncoder, finisher: GainerFinisher },
  'lowpass': { filter: LowpassBiquadFilter, encoder: BiquadEncoder, finisher: BiquadFinisher },
  'highpass': { filter: HighpassBiquadFilter, encoder: BiquadEncoder, finisher: BiquadFinisher },
  'bandpass': { filter: BandpassBiquadFilter, encoder: BiquadEncoder, finisher: BiquadFinisher },
  'lowshelf': { filter: LowshelfBiquadFilter, encoder: BiquadEncoder, finisher: BiquadFinisher },
  'highshelf': { filter: HighshelfBiquadFilter, encoder: BiquadEncoder, finisher: BiquadFinisher },
  'peaking': { filter: PeakingBiquadFilter, encoder: BiquadEncoder, finisher: BiquadFinisher },
  'notch': { filter: NotchBiquadFilter, encoder: BiquadEncoder, finisher: BiquadFinisher },
  'allpass': { filter: AllpassBiquadFilter, encoder: BiquadEncoder, finisher: BiquadFinisher },
  'defaultCompressor': { filter: DefaultDynamicCompressor, encoder: CompressorEncoder, finisher: CompressorFinisher },
  'distortion': { filter: DistortionFilter, encoder: DistortionEncoder, finisher: DistortionFinisher }
};


export const FilterExtraChannelTypes = {
  gain2: { type: LOUDNESS_chn },
  biquadDetune: { type: DETUNE_chn },
  biquadPitch: { type: PITCH_chn }
}
