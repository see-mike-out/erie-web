export const NotifyIncoming = 'incoming',
  NotifyBeforePlayback = 'beforePlayback',
  NotifyAfterPlayback = 'afterPlayback',
  NotifyBeforePlay = 'beforePlay',
  NotifyAfterPlay = 'afterPlay',
  NotifyNext = 'next';
export const NotifyTypes = [NotifyIncoming, NotifyBeforePlayback, NotifyAfterPlayback, NotifyBeforePlay, NotifyAfterPlay, NotifyNext]
export type NotifyType = typeof NotifyTypes[number];