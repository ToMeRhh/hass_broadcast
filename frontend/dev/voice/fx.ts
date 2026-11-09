/**
 * Colour effects, as a declarative chain rendered through Web Audio's
 * OfflineAudioContext: filters, drive, ring modulation, combs, chorus,
 * reverb. These dress a voice (radio, stadium, cave); the engines in
 * vocoder.ts and stretch.ts are what change who is speaking.
 */
import { Audio } from "./dsp";

export type Fx =
  | { type: "highpass" | "lowpass"; freq: number; q?: number }
  | { type: "bandpass"; lo: number; hi: number }
  | { type: "peaking" | "lowshelf" | "highshelf"; freq: number; gain: number; q?: number }
  | { type: "drive"; amount: number }
  | { type: "ring"; freq: number; mix: number }
  | { type: "comb"; freq: number; feedback: number; mix: number }
  | { type: "chorus"; voices: number; depthMs: number; rate: number; mix: number }
  | { type: "flanger"; rate: number; depthMs: number; feedback: number; mix: number }
  | { type: "tremolo"; rate: number; depth: number }
  | { type: "compress"; threshold: number; ratio: number }
  | { type: "echo"; delay: number; feedback: number; mix: number }
  | { type: "reverb"; seconds: number; mix: number; predelay?: number; dark?: boolean }
  | { type: "squelch" }
  | { type: "crackle"; amount: number };

/** Seconds of tail an effect adds after the voice ends. */
function tail(fx: Fx): number {
  switch (fx.type) {
    case "reverb": return fx.seconds + (fx.predelay ?? 0);
    case "echo": return fx.delay * Math.ceil(Math.log(0.01) / Math.log(Math.max(0.01, fx.feedback)));
    case "squelch": return 0.6;
    default: return 0;
  }
}

export async function applyFx(audio: Audio, chain: Fx[]): Promise<Audio> {
  if (chain.length === 0) return audio;
  const { rate } = audio;
  const lead = chain.some((f) => f.type === "squelch") ? Math.round(rate * 0.25) : 0;
  const extra = chain.reduce((s, f) => s + tail(f), 0);
  const length = lead + audio.samples.length + Math.round(Math.min(extra, 6) * rate);
  const ctx = new OfflineAudioContext(1, length, rate);

  const buffer = ctx.createBuffer(1, audio.samples.length, rate);
  buffer.copyToChannel(audio.samples.slice(), 0);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.start(lead / rate);

  let node: AudioNode = source;
  for (const fx of chain) node = stage(ctx, node, fx, lead / rate, audio.samples.length / rate);
  node.connect(ctx.destination);

  const out = (await ctx.startRendering()).getChannelData(0);
  return { samples: trimTail(out, lead + audio.samples.length, rate), rate };
}

/** Drop the silent end of an effect tail. */
function trimTail(x: Float32Array, minimum: number, rate: number): Float32Array {
  let end = x.length;
  while (end > minimum && Math.abs(x[end - 1]) < 1e-4) end--;
  return x.slice(0, Math.min(x.length, end + Math.round(rate * 0.05)));
}

function mixer(ctx: BaseAudioContext, dry: AudioNode, wet: AudioNode, mix: number): AudioNode {
  const out = ctx.createGain();
  const d = ctx.createGain();
  const w = ctx.createGain();
  d.gain.value = 1 - mix;
  w.gain.value = mix;
  dry.connect(d).connect(out);
  wet.connect(w).connect(out);
  return out;
}

function lfo(ctx: BaseAudioContext, rate: number, depth: number, target: AudioParam): void {
  const osc = ctx.createOscillator();
  osc.frequency.value = rate;
  const g = ctx.createGain();
  g.gain.value = depth;
  osc.connect(g).connect(target);
  osc.start();
}

function stage(ctx: BaseAudioContext, input: AudioNode, fx: Fx, start: number, duration: number): AudioNode {
  switch (fx.type) {
    case "highpass":
    case "lowpass": {
      const f = ctx.createBiquadFilter();
      f.type = fx.type;
      f.frequency.value = fx.freq;
      f.Q.value = fx.q ?? 0.707;
      return input.connect(f);
    }
    case "bandpass": {
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass"; hp.frequency.value = fx.lo; hp.Q.value = 0.9;
      const hp2 = ctx.createBiquadFilter();
      hp2.type = "highpass"; hp2.frequency.value = fx.lo; hp2.Q.value = 0.6;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass"; lp.frequency.value = fx.hi; lp.Q.value = 0.9;
      const lp2 = ctx.createBiquadFilter();
      lp2.type = "lowpass"; lp2.frequency.value = fx.hi; lp2.Q.value = 0.6;
      return input.connect(hp).connect(hp2).connect(lp).connect(lp2);
    }
    case "peaking":
    case "lowshelf":
    case "highshelf": {
      const f = ctx.createBiquadFilter();
      f.type = fx.type;
      f.frequency.value = fx.freq;
      f.gain.value = fx.gain;
      if (fx.q) f.Q.value = fx.q;
      return input.connect(f);
    }
    case "drive": {
      const shaper = ctx.createWaveShaper();
      const curve = new Float32Array(2048);
      const k = 1 + fx.amount * 20;
      for (let i = 0; i < curve.length; i++) {
        const x = (i / (curve.length - 1)) * 2 - 1;
        curve[i] = Math.tanh(k * x) / Math.tanh(k);
      }
      shaper.curve = curve;
      shaper.oversample = "4x";
      const pre = ctx.createGain();
      pre.gain.value = 1.2;
      return input.connect(pre).connect(shaper);
    }
    case "ring": {
      const ring = ctx.createGain();
      ring.gain.value = 0;
      const osc = ctx.createOscillator();
      osc.frequency.value = fx.freq;
      osc.connect(ring.gain);
      osc.start();
      input.connect(ring);
      return mixer(ctx, input, ring, fx.mix);
    }
    case "comb": {
      const delay = ctx.createDelay(0.1);
      delay.delayTime.value = 1 / fx.freq;
      const fb = ctx.createGain();
      fb.gain.value = fx.feedback;
      const sum = ctx.createGain();
      input.connect(sum);
      sum.connect(delay).connect(fb).connect(sum);
      return mixer(ctx, input, sum, fx.mix);
    }
    case "chorus": {
      const wet = ctx.createGain();
      wet.gain.value = 1 / fx.voices;
      for (let v = 0; v < fx.voices; v++) {
        const d = ctx.createDelay(0.1);
        d.delayTime.value = 0.012 + v * 0.007;
        lfo(ctx, fx.rate * (1 + v * 0.31), fx.depthMs / 1000, d.delayTime);
        input.connect(d).connect(wet);
      }
      return mixer(ctx, input, wet, fx.mix);
    }
    case "flanger": {
      const d = ctx.createDelay(0.05);
      d.delayTime.value = 0.004;
      lfo(ctx, fx.rate, fx.depthMs / 1000, d.delayTime);
      const fb = ctx.createGain();
      fb.gain.value = fx.feedback;
      input.connect(d);
      d.connect(fb).connect(d);
      return mixer(ctx, input, d, fx.mix);
    }
    case "tremolo": {
      const g = ctx.createGain();
      g.gain.value = 1 - fx.depth / 2;
      lfo(ctx, fx.rate, fx.depth / 2, g.gain);
      return input.connect(g);
    }
    case "compress": {
      const c = ctx.createDynamicsCompressor();
      c.threshold.value = fx.threshold;
      c.ratio.value = fx.ratio;
      c.attack.value = 0.003;
      c.release.value = 0.15;
      c.knee.value = 6;
      const makeup = ctx.createGain();
      makeup.gain.value = 10 ** ((-fx.threshold * (1 - 1 / fx.ratio)) / 2 / 20);
      return input.connect(c).connect(makeup);
    }
    case "echo": {
      const d = ctx.createDelay(2);
      d.delayTime.value = fx.delay;
      const fb = ctx.createGain();
      fb.gain.value = fx.feedback;
      const tone = ctx.createBiquadFilter();
      tone.type = "lowpass";
      tone.frequency.value = 3000;
      input.connect(d);
      d.connect(tone).connect(fb).connect(d);
      const out = ctx.createGain();
      input.connect(out);
      const w = ctx.createGain();
      w.gain.value = fx.mix;
      d.connect(w).connect(out);
      return out;
    }
    case "reverb": {
      const conv = ctx.createConvolver();
      conv.buffer = impulse(ctx, fx.seconds, fx.predelay ?? 0.02, fx.dark ?? false);
      input.connect(conv);
      return mixer(ctx, input, conv, fx.mix);
    }
    case "squelch": {
      // A walkie-talkie's key-up hiss, then key-down hiss and the roger beep.
      const out = ctx.createGain();
      input.connect(out);
      const burst = (at: number, seconds: number) => {
        const src = ctx.createBufferSource();
        src.buffer = noise(ctx, seconds, 0.25);
        src.connect(out);
        src.start(at);
      };
      burst(0, start);
      const end = start + duration;
      const beep = ctx.createOscillator();
      beep.frequency.value = 1350;
      const bg = ctx.createGain();
      bg.gain.value = 0;
      bg.gain.setValueAtTime(0.25, end + 0.05);
      bg.gain.setValueAtTime(0, end + 0.2);
      beep.connect(bg).connect(out);
      beep.start();
      burst(end + 0.2, 0.3);
      return out;
    }
    case "crackle": {
      const src = ctx.createBufferSource();
      src.buffer = crackle(ctx, start + duration + 0.2, fx.amount);
      const out = ctx.createGain();
      input.connect(out);
      src.connect(out);
      src.start();
      return out;
    }
  }
}

function noise(ctx: BaseAudioContext, seconds: number, level: number): AudioBuffer {
  const b = ctx.createBuffer(1, Math.max(1, Math.round(seconds * ctx.sampleRate)), ctx.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) {
    const fade = Math.min(1, i / (0.01 * ctx.sampleRate), (d.length - i) / (0.02 * ctx.sampleRate));
    d[i] = (Math.random() * 2 - 1) * level * fade;
  }
  return b;
}

function crackle(ctx: BaseAudioContext, seconds: number, amount: number): AudioBuffer {
  const b = ctx.createBuffer(1, Math.round(seconds * ctx.sampleRate), ctx.sampleRate);
  const d = b.getChannelData(0);
  let lp = 0;
  for (let i = 0; i < d.length; i++) {
    lp += 0.05 * ((Math.random() * 2 - 1) - lp);
    d[i] = lp * 0.08 * amount;
    if (Math.random() < 0.0004 * amount) d[i] += (Math.random() * 2 - 1) * 0.5 * amount;
  }
  return b;
}

/** Exponentially decaying noise; `dark` rolls the highs off faster, like stone. */
function impulse(ctx: BaseAudioContext, seconds: number, predelay: number, dark: boolean): AudioBuffer {
  const rate = ctx.sampleRate;
  const len = Math.round((seconds + predelay) * rate);
  const b = ctx.createBuffer(1, len, rate);
  const d = b.getChannelData(0);
  const pre = Math.round(predelay * rate);
  let lp = 0;
  for (let i = pre; i < len; i++) {
    const t = (i - pre) / rate;
    const env = Math.exp((-6.9 * t) / seconds);
    const white = Math.random() * 2 - 1;
    const k = dark ? 0.08 + 0.5 * env : 0.3 + 0.6 * env;
    lp += k * (white - lp);
    d[i] = lp * env;
  }
  return b;
}
