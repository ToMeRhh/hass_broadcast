/**
 * The voices. Each is an engine (what changes who is speaking) plus an
 * optional effects chain (what room or device they are speaking through).
 * Add or edit freely; the lab renders whatever is here.
 */
import { Fx } from "./fx";
import { StretchParams } from "./stretch";
import { VoiceParams } from "./vocoder";

export type Engine =
  | { kind: "none" }
  /** Play faster/slower: pitch, formants and timing all move together. */
  | { kind: "resample"; semitones: number }
  | ({ kind: "stretch" } & StretchParams)
  /** One or more vocoder voices, mixed. Several = harmony from one take. */
  | { kind: "vocoder"; voices: { params: VoiceParams; gain?: number }[] };

export interface Preset {
  id: string;
  name: string;
  emoji: string;
  group: "voices" | "places" | "compare";
  note: string;
  engine: Engine;
  fx?: Fx[];
}

const st = (n: number) => 2 ** (n / 12);
const one = (params: VoiceParams): Engine => ({ kind: "vocoder", voices: [{ params }] });
const C_MAJOR = [0, 2, 4, 5, 7, 9, 11];

export const PRESETS: Preset[] = [
  // ---- Characters: who is speaking --------------------------------------
  {
    id: "chipmunk", name: "Chipmunk", emoji: "🐿️", group: "voices",
    note: "Pitch up 8 semitones with the formants dragged along: the classic cartoon.",
    engine: { kind: "stretch", semitones: 8 },
  },
  {
    id: "kid", name: "Kid", emoji: "🧒", group: "voices",
    note: "Higher pitch and a smaller vocal tract, timing untouched.",
    engine: one({ pitch: st(6), formant: st(3), expressive: 1.25 }),
  },
  {
    id: "giant", name: "Giant", emoji: "🗿", group: "voices",
    note: "An octave-ish down with a bigger vocal tract, in a big hall.",
    engine: one({ pitch: st(-9), formant: st(-3.5), tilt: -1 }),
    fx: [{ type: "lowshelf", freq: 180, gain: 4 }, { type: "reverb", seconds: 2.2, mix: 0.22 }],
  },
  {
    id: "helium", name: "Helium", emoji: "🎈", group: "voices",
    note: "What helium really does: formants way up, pitch nearly where it was.",
    engine: one({ pitch: st(2), formant: st(6.5) }),
  },
  {
    id: "swap-up", name: "Voice swap ↑", emoji: "🔼", group: "voices",
    note: "Typical adult voice lowered-to-raised: pitch ×1.75, vocal tract 17 % shorter.",
    engine: one({ pitch: 1.75, formant: 1.17, breath: 0.08 }),
  },
  {
    id: "swap-down", name: "Voice swap ↓", emoji: "🔽", group: "voices",
    note: "The reverse: pitch ×0.57, vocal tract 15 % longer.",
    engine: one({ pitch: 0.57, formant: 0.86 }),
  },
  {
    id: "robot", name: "Robot", emoji: "🤖", group: "voices",
    note: "Your vocal tract on a perfectly flat 110 Hz buzz, through a metal comb.",
    engine: one({ monotone: 110, breath: 0 }),
    fx: [{ type: "comb", freq: 220, feedback: 0.55, mix: 0.45 }, { type: "highpass", freq: 120 }, { type: "drive", amount: 0.15 }],
  },
  {
    id: "dalek", name: "Exterminator", emoji: "⚡", group: "voices",
    note: "The 1963 recipe: ring modulation with a 30 Hz sine, nothing else.",
    engine: { kind: "none" },
    fx: [{ type: "ring", freq: 30, mix: 1 }, { type: "bandpass", lo: 180, hi: 4500 }, { type: "drive", amount: 0.3 }],
  },
  {
    id: "alien", name: "Alien", emoji: "👽", group: "voices",
    note: "Formants up and wobbling at 6 Hz, a dash of ring modulation and flanger.",
    engine: one({ pitch: st(4), formant: st(5), formantLfo: { rate: 6, depth: 0.08 } }),
    fx: [{ type: "ring", freq: 90, mix: 0.3 }, { type: "flanger", rate: 0.4, depthMs: 2, feedback: 0.5, mix: 0.4 }],
  },
  {
    id: "villain", name: "Dark lord", emoji: "🦹", group: "voices",
    note: "Deep, breathy and slightly overdriven inside a helmet.",
    engine: one({ pitch: 0.6, formant: 0.82, breath: 0.08, tilt: -1 }),
    fx: [{ type: "drive", amount: 0.35 }, { type: "lowpass", freq: 4200 }, { type: "comb", freq: 160, feedback: 0.25, mix: 0.25 }, { type: "reverb", seconds: 0.5, mix: 0.15 }],
  },
  {
    id: "monster", name: "Monster", emoji: "👹", group: "voices",
    note: "An octave down with period-doubling growl and a huge vocal tract.",
    engine: one({ pitch: 0.5, formant: 0.74, subharmonic: 0.35, breath: 0.15 }),
    fx: [{ type: "drive", amount: 0.5 }, { type: "lowshelf", freq: 200, gain: 5 }, { type: "reverb", seconds: 1.2, mix: 0.18, dark: true }],
  },
  {
    id: "ghost", name: "Ghost", emoji: "👻", group: "voices",
    note: "A whisper — the same words with no vocal-fold buzz at all — in a crypt.",
    engine: one({ whisper: true, formant: st(1) }),
    fx: [{ type: "tremolo", rate: 3.5, depth: 0.35 }, { type: "reverb", seconds: 4, mix: 0.45, predelay: 0.06, dark: true }],
  },
  {
    id: "autotune", name: "Auto-tune", emoji: "🎤", group: "voices",
    note: "Every syllable snapped hard to C major, with that robotic step between notes.",
    engine: one({ tune: { scale: C_MAJOR, strength: 1, glideMs: 12 } }),
    fx: [{ type: "chorus", voices: 2, depthMs: 1.5, rate: 0.8, mix: 0.2 }, { type: "reverb", seconds: 1.4, mix: 0.15 }],
  },
  {
    id: "barbershop", name: "Barbershop", emoji: "🎶", group: "voices",
    note: "Four of you from one take: root, third, fifth and a bass an octave down.",
    engine: {
      kind: "vocoder",
      voices: [
        { params: { tune: { scale: C_MAJOR, strength: 0.7, glideMs: 40 } }, gain: 1 },
        { params: { pitch: st(4), formant: st(1), tune: { scale: C_MAJOR, strength: 0.7, glideMs: 40 } }, gain: 0.65 },
        { params: { pitch: st(7), formant: st(1.5), tune: { scale: C_MAJOR, strength: 0.7, glideMs: 40 } }, gain: 0.55 },
        { params: { pitch: 0.5, formant: st(-2), tune: { scale: C_MAJOR, strength: 0.7, glideMs: 40 } }, gain: 0.6 },
      ],
    },
    fx: [{ type: "reverb", seconds: 1.6, mix: 0.2 }],
  },
  {
    id: "opera", name: "Opera", emoji: "🎭", group: "voices",
    note: "Exaggerated melody with a wide 5.5 Hz vibrato, in a concert hall.",
    engine: one({ expressive: 1.7, vibrato: { rate: 5.5, cents: 70 }, formant: st(-0.5) }),
    fx: [{ type: "reverb", seconds: 2.8, mix: 0.3, predelay: 0.03 }],
  },
  {
    id: "grandpa", name: "Old timer", emoji: "👴", group: "voices",
    note: "Irregular, breathy and trembling: jitter, shimmer and a 7 Hz tremor.",
    engine: one({ pitch: st(-1), jitter: 0.01, shimmer: 0.12, breath: 0.12, vibrato: { rate: 6.5, cents: 35 }, formant: st(-0.5) }),
    fx: [{ type: "highpass", freq: 140 }],
  },

  // ---- Places and devices: what they are speaking through ---------------
  {
    id: "walkie", name: "Walkie-talkie", emoji: "📟", group: "places",
    note: "Narrow band, clipped, squelch on key-up and a roger beep at the end.",
    engine: { kind: "none" },
    fx: [{ type: "compress", threshold: -30, ratio: 6 }, { type: "bandpass", lo: 450, hi: 2800 }, { type: "drive", amount: 0.55 }, { type: "squelch" }],
  },
  {
    id: "stadium", name: "Stadium", emoji: "🏟️", group: "places",
    note: "PA announcer: compressed, presence boost, slap-back and a huge space.",
    engine: { kind: "none" },
    fx: [{ type: "compress", threshold: -28, ratio: 5 }, { type: "peaking", freq: 2500, gain: 5, q: 0.8 }, { type: "highpass", freq: 160 }, { type: "echo", delay: 0.22, feedback: 0.3, mix: 0.35 }, { type: "reverb", seconds: 3.5, mix: 0.3, predelay: 0.05 }],
  },
  {
    id: "radio", name: "Old radio", emoji: "📻", group: "places",
    note: "1940s broadcast: telephone band, warm overdrive, crackle.",
    engine: { kind: "none" },
    fx: [{ type: "bandpass", lo: 320, hi: 3200 }, { type: "drive", amount: 0.35 }, { type: "peaking", freq: 1200, gain: 4 }, { type: "crackle", amount: 1 }],
  },
  {
    id: "cave", name: "Cave", emoji: "🕳️", group: "places",
    note: "Long dark reverb with a distant echo.",
    engine: { kind: "none" },
    fx: [{ type: "echo", delay: 0.38, feedback: 0.35, mix: 0.25 }, { type: "reverb", seconds: 3.2, mix: 0.4, dark: true, predelay: 0.04 }],
  },

  // ---- Engine comparison: one target, every method ----------------------
  {
    id: "cmp-vocoder-identity", name: "Vocoder, no change", emoji: "🔬", group: "compare",
    note: "Analysis → resynthesis with nothing modified. How transparent the vocoder itself is.",
    engine: one({}),
  },
  {
    id: "cmp-resample-up", name: "+5 st · resample", emoji: "🔬", group: "compare",
    note: "Played faster. Pitch, formants and speed all change together: tape-speed chipmunk.",
    engine: { kind: "resample", semitones: 5 },
  },
  {
    id: "cmp-stretch-up", name: "+5 st · pitch shift only", emoji: "🔬", group: "compare",
    note: "Signalsmith Stretch, no formant compensation: timing kept, formants still dragged up.",
    engine: { kind: "stretch", semitones: 5 },
  },
  {
    id: "cmp-stretch-up-f", name: "+5 st · Stretch + formants", emoji: "🔬", group: "compare",
    note: "Signalsmith Stretch with formant compensation: same person, higher.",
    engine: { kind: "stretch", semitones: 5, formantCompensation: true },
  },
  {
    id: "cmp-vocoder-up", name: "+5 st · vocoder", emoji: "🔬", group: "compare",
    note: "Source-filter vocoder: F0 ×1.33, envelope untouched.",
    engine: one({ pitch: st(5) }),
  },
  {
    id: "cmp-stretch-down-f", name: "−6 st · Stretch + formants", emoji: "🔬", group: "compare",
    note: "Signalsmith Stretch, formant compensated, downward.",
    engine: { kind: "stretch", semitones: -6, formantCompensation: true },
  },
  {
    id: "cmp-vocoder-down", name: "−6 st · vocoder", emoji: "🔬", group: "compare",
    note: "Source-filter vocoder, downward.",
    engine: one({ pitch: st(-6) }),
  },
  {
    id: "cmp-stretch-formant", name: "Formants +4 st · Stretch", emoji: "🔬", group: "compare",
    note: "Formant shift alone (pitch kept) with Signalsmith Stretch.",
    engine: { kind: "stretch", semitones: 0, formantCompensation: true, formantSemitones: 4 },
  },
  {
    id: "cmp-vocoder-formant", name: "Formants +4 st · vocoder", emoji: "🔬", group: "compare",
    note: "Formant shift alone (pitch kept) with the vocoder's envelope warp.",
    engine: one({ formant: st(4) }),
  },
];
