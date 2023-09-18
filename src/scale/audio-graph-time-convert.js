export function makeBeatFunction(tempo) {
  return (beat) => {
    return beat * 60 / tempo;
  }
}

export function makeBeatRounder(tempo, r) {
  return (sec) => {
    if (sec.constructor.name !== 'Number') return sec;
    let beats = sec / tempo * 60;
    return Math.round(beats / r) * r;
  }
}