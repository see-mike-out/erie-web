export interface PlaybackEvent {
    type: 'manual' | 'conditional' | 'automatic',
    playback_unit: 'data points' | 'time',
    playback_num: number,
}
// conditional, manual, or automatic playback: define how much to go back (time or data)
    // if conditional: should be provided
    // manual
    // automatic