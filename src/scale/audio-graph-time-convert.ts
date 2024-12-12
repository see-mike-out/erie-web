export function makeBeatFunction(tempo: number): (a: number) => number {
  return (beat) => {
    return beat * 60 / tempo;
  }
}

export function makeBeatRounder(tempo: number, r: number): <T>(a: T) => T {
  return (sec: any) => {
    if (typeof sec !== 'number') return sec;
    let beats = sec / tempo * 60;
    return Math.round(beats / r) * r;
  }
}