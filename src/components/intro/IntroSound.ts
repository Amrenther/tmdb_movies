let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let _muted = false;

function getCtx(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    const ctx: AudioContext = new AudioContextClass();
    masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(_muted ? 0 : 1, ctx.currentTime);
    masterGain.connect(ctx.destination);
    audioCtx = ctx;
    return ctx;
  }
  return audioCtx;
}

function createOsc(ctx: AudioContext, type: OscillatorType, freq: number, startTime: number, duration: number, peakGain: number, destination: AudioNode) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  g.gain.setValueAtTime(0, startTime);
  g.gain.linearRampToValueAtTime(peakGain, startTime + duration * 0.15);
  g.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.connect(g); g.connect(destination);
  osc.start(startTime); osc.stop(startTime + duration + 0.05);
}

function playSubBass(ctx: AudioContext, dest: AudioNode, t: number) {
  createOsc(ctx, 'sine', 42, t, 1.4, 0.9, dest);
  createOsc(ctx, 'sine', 55, t + 0.05, 1.2, 0.5, dest);
  createOsc(ctx, 'triangle', 80, t + 0.1, 0.9, 0.3, dest);
}

function playShimmer(ctx: AudioContext, dest: AudioNode, t: number) {
  [880, 1174, 1397, 1760, 2093].forEach((f, i) => {
    createOsc(ctx, 'sine', f, t + i * 0.04, 0.5 - i * 0.06, 0.18 - i * 0.02, dest);
  });
}

function playShockwave(ctx: AudioContext, dest: AudioNode, t: number) {
  const bufSize = ctx.sampleRate * 0.4;
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filt = ctx.createBiquadFilter();
  filt.type = 'bandpass';
  filt.frequency.setValueAtTime(200, t);
  filt.frequency.exponentialRampToValueAtTime(2000, t + 0.3);
  filt.Q.value = 0.8;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.45, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
  src.connect(filt); filt.connect(g); g.connect(dest);
  src.start(t); src.stop(t + 0.4);
}

function playRibbonSweep(ctx: AudioContext, dest: AudioNode, t: number) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(110, t);
  osc.frequency.exponentialRampToValueAtTime(440, t + 0.8);
  const filt = ctx.createBiquadFilter();
  filt.type = 'lowpass';
  filt.frequency.setValueAtTime(300, t);
  filt.frequency.exponentialRampToValueAtTime(3000, t + 0.7);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.22, t + 0.1);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.85);
  osc.connect(filt); filt.connect(g); g.connect(dest);
  osc.start(t); osc.stop(t + 0.9);
}

export async function playIntroSound() {
  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') await ctx.resume();
    const dest = masterGain!;
    const t = ctx.currentTime;
    playRibbonSweep(ctx, dest, t);
    playSubBass(ctx, dest, t + 0.1);
    playShockwave(ctx, dest, t + 1.0);
    playShimmer(ctx, dest, t + 1.05);
    createOsc(ctx, 'sine', 220, t + 1.6, 1.1, 0.28, dest);
  } catch { /* autoplay blocked */ }
}

export function setIntroMuted(muted: boolean) {
  _muted = muted;
  if (masterGain && audioCtx) {
    masterGain.gain.setTargetAtTime(muted ? 0 : 1, audioCtx.currentTime, 0.05);
  }
}

export function isIntroMuted() { return _muted; }
