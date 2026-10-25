/**
 * Sound lab: record one take through several capture presets at once, then
 * listen to each — as the WAV the card uploads, and as the MP3 the speaker is
 * handed. See frontend/dev/README.md.
 *
 * Every preset is a real `Recorder` with its own getUserMedia stream, so what
 * is heard here is the shipped capture path, not an imitation of it.
 */
import { LitElement, css, html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";

import { CaptureOptions, RAW_MIC, Recorder } from "../src/recorder";

const PROCESSING = ["echoCancellation", "noiseSuppression", "autoGainControl"] as const;

/** What the browser does to a voice before we see it, all on: its default. */
const CALL_PROCESSING: MediaTrackConstraints = {
  channelCount: 1,
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

interface Preset {
  name: string;
  note: string;
  /** Omitted fields fall back to what the card ships. */
  capture: CaptureOptions;
  /** libmp3lame bitrate for the server-side transcode. */
  bitrate: string;
}

// Add or edit freely; the page renders whatever is here.
const PRESETS: Preset[] = [
  {
    name: "Shipped",
    note: "What the card does now: 48 kHz, raw mic, quiet takes boosted, recording 0.5 s past the stop, 128k MP3.",
    capture: {},
    bitrate: "128k",
  },
  {
    name: "v0.7.0",
    note: "Before the fix: 16 kHz, browser call processing on, 64k MP3.",
    capture: { sampleRate: 16000, constraints: CALL_PROCESSING, normalize: false },
    bitrate: "64k",
  },
  {
    name: "48 kHz + call processing",
    note: "Full band, but with noise suppression, gain control and echo cancellation on.",
    capture: { constraints: CALL_PROCESSING },
    bitrate: "128k",
  },
  {
    name: "Shipped + noise suppression",
    note: "The card's noise_suppression setting: removes the background, rest of the mic raw.",
    capture: { noiseSuppression: true },
    bitrate: "128k",
  },
  {
    name: "Stop at release",
    note: "Before the fix: the take ends the instant the button is let go, losing the last word on a phone.",
    capture: { stopTail: 0 },
    bitrate: "128k",
  },
  {
    name: "16 kHz raw",
    note: "The rate long takes (max duration near 300 s) still fall back to.",
    capture: { sampleRate: 16000 },
    bitrate: "128k",
  },
];

const MAX_SECONDS = 60;

interface Take {
  rate?: number;
  settings?: MediaTrackSettings;
  duration?: number;
  wav?: string;
  wavBytes?: number;
  mp3?: string;
  mp3Bytes?: number;
  mp3Error?: string;
  error?: string;
  /** Processing the preset asked for but the browser did not apply. */
  denied?: string[];
}

@customElement("sound-lab")
export class SoundLab extends LitElement {
  @state() private phase: "idle" | "starting" | "recording" | "processing" = "idle";
  @state() private takes: Take[] = PRESETS.map(() => ({}));
  @state() private elapsed = 0;
  @state() private level = 0;

  /** Indexed like PRESETS; undefined for presets not in the current take. */
  private recorders: (Recorder | undefined)[] = [];
  private timer?: number;

  static styles = css`
    :host {
      display: block; min-height: 100vh; box-sizing: border-box;
      padding: 24px 16px 64px; background: #1f2430; color: #e6e6e6;
      font: 14px/1.5 Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    main { max-width: 760px; margin: 0 auto; }
    h1 { font-size: 20px; margin: 0 0 4px; }
    a { color: #8fb4ff; }
    .lede { color: #8f9bb3; margin: 0 0 20px; }
    .bar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; }
    button {
      background: #3d7dff; color: #fff; border: 0; border-radius: 8px;
      padding: 10px 18px; font: inherit; font-weight: 600; cursor: pointer;
    }
    button[data-recording] { background: #e5484d; }
    button:disabled { opacity: 0.5; cursor: default; }
    .meter { flex: 1; min-width: 120px; height: 8px; background: #2b3242; border-radius: 4px; overflow: hidden; }
    .meter > div { height: 100%; background: #46a758; transition: width 60ms linear; }
    .time { font-variant-numeric: tabular-nums; color: #b8c2d8; }
    .preset {
      background: #262c3a; border: 1px solid #3c465c; border-radius: 10px;
      padding: 14px; margin-bottom: 12px;
    }
    .preset h2 { font-size: 15px; margin: 0; }
    .head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    button.alone {
      background: #2b3242; color: #b8c2d8; border: 1px solid #3c465c;
      padding: 4px 10px; font-weight: 400; font-size: 12px;
    }
    .preset p { margin: 2px 0 8px; color: #8f9bb3; font-size: 13px; }
    .chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
    .chip { background: #2b3242; border-radius: 4px; padding: 1px 6px; font-size: 12px; color: #b8c2d8; }
    .chip[data-on] { color: #ffb224; }
    .players { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .players label { font-size: 12px; color: #8f9bb3; display: block; }
    audio { width: 100%; height: 36px; }
    .error { color: #ff6369; font-size: 13px; }
    code { background: #2b3242; padding: 1px 4px; border-radius: 3px; }
    @media (max-width: 560px) { .players { grid-template-columns: 1fr; } }
  `;

  render() {
    if (!Recorder.isSupported()) {
      return html`<main>
        <h1>Sound lab</h1>
        <p class="error">
          <code>${location.host}</code> is not a secure context, so the browser hides
          the microphone. Open this page on <code>localhost</code>. From an Android
          phone over USB: <code>adb reverse tcp:${location.port || 80} tcp:${location.port || 80}</code>,
          then <code>http://localhost:${location.port || 80}/lab</code> in Chrome.
        </p>
      </main>`;
    }
    const busy = this.phase === "starting" || this.phase === "processing";
    return html`<main>
      <h1>Sound lab</h1>
      <p class="lede">
        One take, recorded through every preset at the same time. Use headphones
        to listen. <a href="/">← card harness</a>
      </p>
      <p class="lede">
        Rate, boost and bitrate compare fairly in a shared take. Browser
        processing may not: Chrome can give every open stream on a mic the same
        processing, so a preset it overrode is flagged — record that one alone.
      </p>
      <div class="bar">
        <button
          ?disabled=${busy}
          ?data-recording=${this.phase === "recording"}
          @click=${() =>
            this.phase === "recording" ? this.stop() : this.start(PRESETS.map((_, i) => i))}
        >
          ${this.phase === "recording" ? "Stop" : this.phase === "processing" ? "Encoding…" : "Record all"}
        </button>
        <div class="meter"><div style="width:${Math.round(this.level * 100)}%"></div></div>
        <span class="time">${this.elapsed}s / ${MAX_SECONDS}s</span>
      </div>
      ${PRESETS.map((preset, i) => this.renderPreset(preset, this.takes[i], i))}
    </main>`;
  }

  private renderPreset(preset: Preset, take: Take, index: number) {
    const s = take.settings;
    const flag = (label: string, value: unknown) =>
      value === undefined
        ? nothing
        : html`<span class="chip" ?data-on=${value === true}>${label} ${value ? "on" : "off"}</span>`;
    return html`<section class="preset">
      <div class="head">
        <h2>${preset.name}</h2>
        <button
          class="alone"
          ?disabled=${this.phase !== "idle"}
          @click=${() => this.start([index])}
        >
          Record alone
        </button>
      </div>
      <p>${preset.note}</p>
      ${take.denied?.length
        ? html`<div class="error">
            Not what this preset asked for (${take.denied.join(", ")}): another
            open stream's processing won. Record this one alone.
          </div>`
        : nothing}
      ${take.rate || s
        ? html`<div class="chips">
            ${take.rate ? html`<span class="chip">${take.rate / 1000} kHz</span>` : nothing}
            ${flag("echo cancel", s?.echoCancellation)}
            ${flag("noise suppr.", s?.noiseSuppression)}
            ${flag("auto gain", s?.autoGainControl)}
            ${take.duration !== undefined ? html`<span class="chip">${take.duration.toFixed(1)} s</span>` : nothing}
          </div>`
        : nothing}
      ${take.error ? html`<div class="error">${take.error}</div>` : nothing}
      ${take.wav
        ? html`<div class="players">
            <div>
              <label>WAV, as uploaded · ${kb(take.wavBytes)}</label>
              <audio controls preload="auto" src=${take.wav}></audio>
            </div>
            <div>
              <label>MP3 ${preset.bitrate}, as the speaker gets it${take.mp3Bytes ? ` · ${kb(take.mp3Bytes)}` : ""}</label>
              ${take.mp3
                ? html`<audio controls preload="auto" src=${take.mp3}></audio>`
                : html`<div class="error">${take.mp3Error ?? "encoding…"}</div>`}
            </div>
          </div>`
        : nothing}
    </section>`;
  }

  private patchTake(i: number, patch: Partial<Take>): void {
    this.takes = this.takes.map((take, j) => (j === i ? { ...take, ...patch } : take));
  }

  /** Record the presets at `indices` together; the others keep their last take. */
  private async start(indices: number[]): Promise<void> {
    for (const i of indices) {
      const take = this.takes[i];
      if (take.wav) URL.revokeObjectURL(take.wav);
      if (take.mp3) URL.revokeObjectURL(take.mp3);
    }
    this.takes = this.takes.map((take, i) => (indices.includes(i) ? {} : take));
    this.phase = "starting";
    this.elapsed = 0;

    // Started together so every preset hears the same words. A preset the
    // browser refuses (an unsupported rate, say) fails alone.
    this.recorders = PRESETS.map((_, i) => (indices.includes(i) ? new Recorder() : undefined));
    this.recorders[indices[0]]?.onLevel((level) => (this.level = level));
    await Promise.all(
      this.recorders.map(async (recorder, i) => {
        if (!recorder) return;
        try {
          await recorder.start(MAX_SECONDS, PRESETS[i].capture);
        } catch (error) {
          this.recorders[i] = undefined;
          this.patchTake(i, { error: describe(error) });
          return;
        }
        const settings = recorder.trackSettings;
        this.patchTake(i, { settings, denied: denied(PRESETS[i], settings) });
      })
    );
    if (!this.recorders.some(Boolean)) {
      this.phase = "idle";
      return;
    }

    this.phase = "recording";
    this.timer = window.setInterval(() => {
      this.elapsed += 1;
      if (this.elapsed >= MAX_SECONDS) void this.stop();
    }, 1000);
  }

  private async stop(): Promise<void> {
    if (this.phase !== "recording") return;
    window.clearInterval(this.timer);
    this.phase = "processing";
    this.level = 0;

    await Promise.all(
      this.recorders.map(async (recorder, i) => {
        if (!recorder) return;
        const { blob, duration } = await recorder.stop();
        const rate = new DataView(await blob.slice(24, 28).arrayBuffer()).getUint32(0, true);
        this.patchTake(i, { rate, duration, wav: URL.createObjectURL(blob), wavBytes: blob.size });
        this.patchTake(i, await transcode(blob, PRESETS[i].bitrate));
      })
    );
    this.recorders = [];
    this.phase = "idle";
  }
}

/** Processing the preset asked for that the browser's granted settings contradict. */
function denied(preset: Preset, settings?: MediaTrackSettings): string[] {
  const wanted = preset.capture.constraints ?? {
    ...RAW_MIC,
    noiseSuppression: preset.capture.noiseSuppression ?? false,
  };
  return PROCESSING.filter(
    (key) => typeof wanted[key] === "boolean" && settings?.[key] !== undefined && settings[key] !== wanted[key]
  ).map((key) => `${key} ${wanted[key] ? "on" : "off"}`);
}

/** The server's own MP3 step, run by serve.mjs with the same ffmpeg arguments. */
async function transcode(wav: Blob, bitrate: string): Promise<Partial<Take>> {
  try {
    const response = await fetch(`/lab/mp3?bitrate=${encodeURIComponent(bitrate)}`, {
      method: "POST",
      body: wav,
    });
    if (!response.ok) {
      return { mp3Error: await response.text() };
    }
    const mp3 = await response.blob();
    return { mp3: URL.createObjectURL(mp3), mp3Bytes: mp3.size };
  } catch (error) {
    return { mp3Error: describe(error) };
  }
}

function describe(error: unknown): string {
  return error instanceof Error ? `${error.name}: ${error.message}` : String(error);
}

function kb(bytes?: number): string {
  return bytes === undefined ? "" : `${Math.round(bytes / 1024)} KB`;
}

document.body.append(document.createElement("sound-lab"));
