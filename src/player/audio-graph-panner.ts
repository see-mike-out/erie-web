export function createPanner(ctx: AudioContext | OfflineAudioContext, cartesianInputs: number, gain: GainNode): AudioNode {
  let panner!: AudioNode;

  if (cartesianInputs == 1) {
    const stereoPanner = ctx.createStereoPanner();
    stereoPanner.connect(gain);
    panner = stereoPanner as unknown as AudioNode;
  } else {
    // default values: https://webaudio.github.io/web-audio-api/#PannerNode
    // TODO: max Distance? Scales within 1? -> comment each value
    const panner3D = ctx.createPanner();
    panner3D.connect(gain);
    panner3D.panningModel = 'equalpower';
    panner3D.distanceModel = 'inverse';
    panner3D.refDistance = 1;
    panner3D.maxDistance = 10000;
    panner3D.rolloffFactor = 1;
    panner3D.coneInnerAngle = 360;
    panner3D.coneOuterAngle = 360;
    panner3D.coneOuterGain = 0;
    panner = panner3D as unknown as AudioNode;
  }

  return panner;
}