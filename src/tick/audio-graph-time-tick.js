import { makeInstrument } from "../player/audio-graph-player-proto";
import { round } from "../util/audio-graph-util";

export const Def_Tick_Interval = 0.5, Def_Tick_Interval_Beat = 2, Def_Tick_Duration = 0.1, Def_Tick_Duration_Beat = 0.5, Def_Tick_Loudness = 0.4;
export function makeTick(ctx, def, duration) {
  // ticker definition;
  if (!def) return;
  else if (duration) {
    let tickPattern = [];
    let interval = round(def.interval, -2);
    let tickDur = def.band;
    tickDur = round(tickDur, -2);
    let pause = interval - tickDur;
    let count = Math.floor(duration / interval)
    let totalTime = 0;
    if (def.playAtTime0 === undefined) def.playAtTime0 = true;
    if (def.playAtTime0) {
      tickPattern.push({ tick: tickDur });
      totalTime += tickDur;
    }
    for (let i = 0; i < count; i++) {
      tickPattern.push({ pause });
      tickPattern.push({ tick: tickDur });
      totalTime += pause + tickDur;
    }
    if (duration > totalTime) {
      tickPattern.push({ pause: duration - totalTime });
    }
    let tickInst = makeInstrument(ctx, 'default');
    tickInst.frequency.value = 150;
    if (def.pitch) tickInst.frequency.value = def.pitch;
    if (def.oscType) tickInst.type = def.oscType;
    let gain = ctx.createGain();
    tickInst.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    let acc = 0;
    for (const p of tickPattern) {
      if (p.tick) {
        gain.gain.setTargetAtTime(def.loudness || Def_Tick_Loudness, ctx.currentTime + acc, 0.015);
        acc += p.tick
      } else if (p.pause) {
        gain.gain.setTargetAtTime(0, ctx.currentTime + acc, 0.015);
        acc += p.pause
      }
    }
    return tickInst;
  }
}
