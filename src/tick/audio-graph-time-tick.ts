import { round } from "../util";
import {
  InstrumentNode,
  TickNormed
} from "../types";
import { AudioPrimitiveBuffer } from "../pulse";
import {
  makeInstrument,
  makeOfflineContext
} from "../player/audio-graph-make";

export const Def_Tick_Interval = 0.5,
  Def_Tick_Interval_Beat = 2,
  Def_Tick_Duration = 0.1,
  Def_Tick_Duration_Beat = 0.5,
  Def_Tick_Loudness = 0.4;

export function makeTick(
  ctx: AudioContext | OfflineAudioContext,
  def: TickNormed,
  duration: number | 'indefinite'
): InstrumentNode | (() => InstrumentNode) | null {
  // ticker definition;
  if (!def) return null;
  else if (typeof duration === 'number') {
    let tickPattern = [];
    let interval = round(def.interval ?? 0.5, -2);
    let tickDur = def.band;
    tickDur = round(tickDur ?? 0.1, -2);
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
    if ('frequency' in tickInst) tickInst.frequency.value = 150;
    if (def.pitch && 'frequency' in tickInst) tickInst.frequency.value = def.pitch;
    if (def.oscType && 'type' in tickInst) tickInst.type = def.oscType;
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
  } else if (duration === 'indefinite') {
    // if indefininte, then return a generator
    let interval = round(def.interval ?? 0.5, -2);
    let tickDur = def.band;
    tickDur = round(tickDur ?? 0.1, -2);
    let pause = interval - tickDur;
    if (def.playAtTime0 === undefined) def.playAtTime0 = true;
    let tickPattern = def.playAtTime0 ? [{ tick: tickDur }, { pause }] : [{ pause }, { tick: tickDur }];
    return () => {
      let tickInst = makeInstrument(ctx, 'default');
      if ('frequency' in tickInst) tickInst.frequency.value = 150;
      if (def.pitch && 'frequency' in tickInst) tickInst.frequency.value = def.pitch;
      if (def.oscType && 'type' in tickInst) tickInst.type = def.oscType;
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
  return null;
}

export async function playTick(
  _ctx: AudioContext | OfflineAudioContext,
  def: TickNormed,
  duration: number,
  start: number,
  end: number,
  bufferPrimitve: AudioPrimitiveBuffer | undefined
) {
  let ctx = _ctx;
  if (bufferPrimitve) ctx = makeOfflineContext(duration);
  let tick = makeTick(ctx, def, duration) as OscillatorNode;
  if (tick) {
    tick.start(start);
    tick.stop(end);
  }
  if (bufferPrimitve && ctx instanceof OfflineAudioContext) {
    let rb = await ctx.startRendering();
    bufferPrimitve.add(start, rb);
  }
  return;
}