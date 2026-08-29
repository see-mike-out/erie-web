export const Stopped = 'stopped',
  Playing = 'playing',
  Paused = 'paused',
  MultiPlaying = 'milti-playing',
  Finished = 'finished';

export type PlayerStatus = typeof Stopped | typeof Playing | typeof Paused | typeof MultiPlaying | typeof Finished;