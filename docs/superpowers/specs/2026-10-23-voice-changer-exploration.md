# Voice changer card — exploration

Status: **exploration / proof of concept**. Nothing here ships; the code is a
dev-harness page. This records what was tried, what was measured, and what a
real card would take.

## The idea

A second card beside `hass-broadcast-card`: record a message, tap a voice
(robot, giant, ghost, auto-tune, walkie-talkie…), hear it locally, send it to
speakers. It should sound good, not like a pitch knob turned too far.

## Try it

```bash
npm run dev        # → http://localhost:8099/voice
```

`frontend/dev/voice.ts` is the page; the engines are in `frontend/dev/voice/`.
The left half is a concept of the card (record → tap a voice → preview → send,
the send mocked); the right half lists every preset with its engine, render
time and a WAV download, plus an engine comparison: the same change made by
each method. Record with the mic on `localhost`, or open any audio file.

## Three engines, and what each is for

| Engine | What it does | Good for | Cost (desktop, per second of audio) |
|---|---|---|---|
| **Resample** | plays the clip faster/slower | the "tape speed" contrast only — duration changes | ~0.1× real time |
| **Signalsmith Stretch** (MIT, WASM, 114 KB) | pitch shift with optional formant compensation and formant shift | chipmunk; clean pitch moves of a few semitones | ~0.03× real time |
| **Source-filter vocoder** (ours, ~10 KB) | WORLD-style: analyse F0, spectral envelope and per-band aperiodicity, change any of them independently, resynthesise | everything that is *not* a pitch shift: gender swap, giant, kid, helium, robot (flat F0 on your real envelope), whisper/ghost, auto-tune, harmony from one take, vibrato, growl, tremor | analysis ~0.18×, then ~0.12× per voice |
| **Web Audio effects** | filters, drive, ring mod, comb, chorus, flanger, reverb, echo, squelch + roger beep, crackle | places and devices: walkie-talkie, stadium, old radio, cave; dressing for the voices | ~0.01–0.1× |

The vocoder is what makes "high quality, not just pitch" possible: the vocal
tract (formants) and the vocal folds (pitch, buzz vs breath) are separate
parameters, so a deeper voice can have a bigger head instead of a slowed-down
one, a robot keeps your vowels, and a whisper is the same words with no buzz.

Rejected: Rubber Band (GPL) and SoundTouch (LGPL) — incompatible with this MIT
repo's single bundled file.

### Vocoder implementation notes

- F0: YIN difference function on a 16 kHz copy, candidates joined by a Viterbi
  path that penalises octave jumps (pYIN-flavoured). Creaky phrase ends score
  d′ ≈ 0.5 and must still count as voiced, or they resynthesise as whisper.
- Envelope: CheapTrick (pitch-adaptive window, F0-wide smoothing, cepstral
  lifter).
- Aperiodicity: band-limited autocorrelation at one period (best lag within
  ±4 % for F0 drift), halved — calibrated so resynthesised speech matches its
  source's harmonicity (6.9 dB vs 6.9 dB on CMU ARCTIC bdl; 12.9 vs 13.4 on slt).
- Synthesis: a minimum-phase response per glottal pulse plus a period of
  filtered noise per pulse, filters rebuilt every 10 ms, responses 12 ms.

## Measured

On CMU ARCTIC (bdl male, slt female) and a LibriSpeech utterance, headless
Chromium, checked with an independent pitch tracker (librosa pYIN):

- **Pitch targets are hit**: Kid +6.0 st (asked 6), Voice swap ↑ +9.4 (9.7),
  ↓ −9.6 (−9.7), Giant −9.2 (−9), every comparison row within 0.3 st; Robot
  locked at 110 Hz.
- **Auto-tune works**: 95 % of on-note frames land in C major (source 59 %), 65 %
  within 15 cents of a note (source 29 %).
- **Vocoder transparency**: unmodified resynthesis keeps 61 % voiced frames
  (source 63 %) and harmonicity within 0.5–1 dB; log-mel distance to the
  source 3.2 dB.
- **No NaN, no clipping**, durations preserved (effect tails excepted).
- **Speed** for a 9.9 s take, tap "Kid" → playable:

  | CPU | Analysis | One vocoder voice | Tap → playable |
  |---|---|---|---|
  | desktop | 1.8 s (0.18× RT) | 1.2 s | 2.9 s |
  | 4× throttled (≈ mid-range phone) | 7.2 s (0.72× RT) | 5.0 s | 11.5 s |

  Signalsmith runs on the audio thread, which CPU throttling does not slow, so
  its phone cost is not measured here.

What these numbers cannot say is how it *sounds* — that is the listening test
the page exists for.

## Neural voice conversion

Researched and benchmarked separately (models never touched the repo):

- **MeanVC2** (Apache-2.0 code and weights, ONNX on Hugging Face,
  `kiarina/MeanVC2-ONNX`) is the only realistic candidate: ~96 MB in the
  mixed-precision export (all-int8 is broken: wrong pitch, 58 % WER), RTF
  0.09–0.14 native, ~0.4 in onnxruntime-web WASM on desktop. Speaker similarity
  to the target 0.61–0.66; 16 kHz output.
- RVC needs ~740 MB of front-end models and has no generator export; kNN-VC and
  FreeVC need WavLM-Large (0.6–1.3 GB); OpenVoice V2 barely moves the timbre.
- Home Assistant sends no COOP/COEP headers, so no SharedArrayBuffer and
  single-threaded WASM: estimated 15–20 s for a 10 s clip on a phone, after a
  ~100 MB download. onnxruntime has no musllinux wheel, so server-side would
  have to be a Debian-based add-on.

It converts to *real other people's* voices (from licensed corpora), not
characters. Verdict: not for a first version; possibly a later opt-in "HQ
voices" download. The DSP voices cover the fun.

## Feasibility as a real card

Works without backend changes: a rendered voice is just a WAV, uploaded and
broadcast by the existing `uploadRecording` / `sendClip` path, and stored in
history like any other message.

What a real card needs that the POC does not have:

1. **Speed on phones.** Run the analysis in a Worker *while recording* (it is
   frame-by-frame and below real time even at 4× throttling), so it is done when
   the user lets go. Synthesis is pulse-by-pulse and below real time too, so
   stream it into playback: sound starts in well under a second instead of
   after the whole render. Further headroom if needed: a real-input FFT (the
   FFTs are ~half the cost).
2. **Bundle size.** Engines + Signalsmith: 124 KB minified / 54 KB gzipped,
   against today's 83 KB card. Load it as a separate lazily-imported file from
   the integration's static path with the same `?v=` cache-busting as the card.
3. **Build flag.** Signalsmith builds its worklet by stringifying its own
   functions; with `target: es2021` esbuild lowers class fields to a helper that
   does not exist in the worklet scope and the worklet silently fails to load.
   `build.mjs` needs `supported: { "class-field": true }` — safe, every
   AudioWorklet browser has class fields.
4. **Upload budget.** `captureRate` sizes the take to fit `MAX_UPLOAD_BYTES`;
   reverbs and echoes add up to a few seconds, which the voice card must
   budget for.
5. **Not yet verified on devices:** Android companion WebView and iOS
   WKWebView running a blob-URL AudioWorklet inside an `OfflineAudioContext`
   (Signalsmith). Both support AudioWorklet; the combination needs one real
   test. The vocoder and effects need no worklet.
6. **Config** would follow the existing conventions: flat keys, one editor
   field each, e.g. `voices` (which presets to offer), `speakers`, `mode`,
   `max_duration`, and `noise_suppression` with the card's meaning: the
   browser's own suppression on an otherwise raw mic. The lab's switch does
   exactly that, so a voice card would reuse `Recorder` unchanged. Background
   noise matters more here than in the plain card: the vocoder's pitch tracker
   and aperiodicity estimate read it as part of the voice.

## Open questions

- Which voices earn a place on the card; the POC offers 16 voices and 4 places,
  which is too many chips for one card.
- Voice and place as one choice (as in the POC), or two (robot *in* a stadium)?
- Push-to-talk tile variant with a fixed voice?
