/**
 * Voice changer lab: record (or open) one take, hear it through every voice
 * preset, and compare the engines behind them. See frontend/dev/voice/.
 *
 * The top half is a concept of the card itself — record, tap a voice to hear
 * it, send — so the interaction can be judged, not just the sound. The bottom
 * half is the lab: every preset, its engine, and what it cost to render.
 */
import { LitElement, css, html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";

import { Capture } from "./voice/capture";
import { Audio, decode, toWav } from "./voice/dsp";
import { PRESETS, Preset } from "./voice/presets";
import { analysisOf, render } from "./voice/render";

interface Result {
  url: string;
  bytes: number;
  ms: number;
  seconds: number;
}

const SPEAKERS = ["Kitchen speaker", "Living room", "Kids' room", "Everywhere"];
const ENGINE_LABEL: Record<Preset["engine"]["kind"], string> = {
  none: "effects only",
  resample: "resample",
  stretch: "Signalsmith Stretch",
  vocoder: "vocoder",
};

/** Samples a build can embed for the standalone page: name → WAV URL. */
declare const VOICE_SAMPLES: Record<string, string> | undefined;
/**
 * Neural conversions rendered offline (they need ~100 MB of models), embedded
 * by the standalone build so they can be judged by ear beside the DSP voices.
 */
declare const VOICE_NEURAL: { name: string; note: string; url: string }[] | undefined;

@customElement("voice-lab")
export class VoiceLab extends LitElement {
  @state() private clip?: Audio;
  @state() private clipUrl?: string;
  @state() private recording = false;
  @state() private level = 0;
  @state() private elapsed = 0;
  @state() private results = new Map<string, Result>();
  @state() private busy?: string;
  @state() private selected = "original";
  @state() private playing = false;
  @state() private status = "";
  @state() private speaker = SPEAKERS[0];
  @state() private analysisNote = "";
  @state() private error = "";

  private capture?: Capture;
  private timer?: number;
  private queue: string[] = [];
  private draining = false;
  private player = new window.Audio();
  private generation = 0;

  constructor() {
    super();
    this.player.addEventListener("ended", () => (this.playing = false));
    this.player.addEventListener("pause", () => (this.playing = false));
    this.player.addEventListener("play", () => (this.playing = true));
  }

  static styles = css`
    :host {
      display: block; min-height: 100vh; box-sizing: border-box;
      padding: 24px 16px 64px; background: #1f2430; color: #e6e6e6;
      font: 14px/1.5 Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    main { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 380px 1fr; gap: 28px; align-items: start; }
    @media (max-width: 900px) { main { grid-template-columns: 1fr; } }
    header { max-width: 1100px; margin: 0 auto 20px; }
    h1 { font-size: 20px; margin: 0 0 4px; }
    h2 { font-size: 15px; margin: 18px 0 8px; color: #b8c2d8; font-weight: 600; }
    a { color: #8fb4ff; }
    .lede { color: #8f9bb3; margin: 0 0 6px; max-width: 760px; }
    .sources { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-top: 12px; }
    .sources button, .sources label {
      background: #2b3242; color: #e6e6e6; border: 1px solid #3c465c; border-radius: 8px;
      padding: 6px 12px; font: inherit; cursor: pointer;
    }
    .sources input { display: none; }
    .error { color: #ff6369; }

    /* ---- the card concept, in Home Assistant's default light theme ---- */
    .card {
      position: sticky; top: 16px;
      background: #fff; color: #212121; border-radius: 12px;
      box-shadow: 0 2px 6px rgba(0,0,0,.35); padding: 16px; width: 100%; box-sizing: border-box;
    }
    .card h3 { margin: 0 0 12px; font-size: 20px; font-weight: 400; }
    .core { display: flex; align-items: center; gap: 12px; height: 64px; }
    .mic {
      width: 56px; height: 56px; border-radius: 50%; border: 0; flex: none; cursor: pointer;
      background: #03a9f4; color: #fff; font-size: 24px; display: grid; place-items: center;
      box-shadow: 0 1px 3px rgba(0,0,0,.3);
    }
    .mic[data-rec] { background: #db4437; }
    .strip { flex: 1; height: 40px; border-radius: 20px; background: #f1f3f4; display: flex; align-items: center; padding: 0 14px; gap: 10px; min-width: 0; }
    .strip .meter { flex: 1; height: 6px; background: #dfe3e8; border-radius: 3px; overflow: hidden; }
    .strip .meter > div { height: 100%; background: #db4437; }
    .strip .text { color: #5f6368; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .play {
      width: 28px; height: 28px; border-radius: 50%; border: 0; background: #03a9f4; color: #fff;
      cursor: pointer; flex: none; font-size: 12px;
    }
    .play:disabled { background: #bdbdbd; cursor: default; }
    .voices { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 14px; }
    .voice {
      position: relative; border: 1px solid #e0e0e0; background: #fff; border-radius: 10px;
      padding: 6px 2px 4px; cursor: pointer; font: inherit; color: #212121;
      display: flex; flex-direction: column; align-items: center; gap: 1px; min-width: 0;
    }
    .voice:disabled { opacity: .45; cursor: default; }
    .voice .e { font-size: 22px; line-height: 1.2; }
    .voice .n { font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
    .voice[data-on] { border-color: #03a9f4; background: #e1f5fe; box-shadow: inset 0 0 0 1px #03a9f4; }
    .voice[data-busy]::after {
      content: ""; position: absolute; top: 4px; right: 4px; width: 6px; height: 6px; border-radius: 50%;
      background: #ffb300; animation: pulse 0.8s infinite alternate;
    }
    @keyframes pulse { from { opacity: .3 } to { opacity: 1 } }
    .group { font-size: 11px; color: #757575; margin: 12px 0 0; text-transform: uppercase; letter-spacing: .06em; }
    .send { display: flex; gap: 8px; margin-top: 14px; }
    .send select { flex: 1; border: 1px solid #e0e0e0; border-radius: 8px; padding: 8px; font: inherit; background: #fff; color: #212121; }
    .send button { background: #03a9f4; color: #fff; border: 0; border-radius: 8px; padding: 8px 18px; font: inherit; font-weight: 500; cursor: pointer; }
    .send button:disabled { background: #bdbdbd; }
    .cardstatus { min-height: 20px; margin-top: 8px; font-size: 12px; color: #5f6368; }

    /* ---- the lab ---- */
    .facts { display: flex; flex-wrap: wrap; gap: 6px; margin: 4px 0 8px; }
    .chip { background: #2b3242; border-radius: 4px; padding: 1px 6px; font-size: 12px; color: #b8c2d8; }
    .chip.engine-vocoder { color: #8be9a8; }
    .chip.engine-stretch { color: #ffb224; }
    .chip.engine-resample { color: #ff8080; }
    .row {
      background: #262c3a; border: 1px solid #3c465c; border-radius: 10px;
      padding: 10px 12px; margin-bottom: 8px; display: grid;
      grid-template-columns: 1fr 260px; gap: 4px 12px; align-items: center;
    }
    .row[data-on] { border-color: #8fb4ff; }
    .row .title { font-weight: 600; }
    .row p { margin: 0; color: #8f9bb3; font-size: 12.5px; }
    .row audio { width: 100%; height: 34px; }
    .row .pending { color: #8f9bb3; font-size: 12px; }
    .row .meta { grid-column: 1 / -1; display: flex; gap: 6px; flex-wrap: wrap; }
    @media (max-width: 640px) { .row { grid-template-columns: 1fr; } }
  `;

  render() {
    return html`
      <header>
        <h1>Voice changer lab</h1>
        <p class="lede">
          Record a take (or open a file), then tap a voice in the card to hear it.
          Everything renders in this browser tab from the one recording; nothing
          leaves the page. <a href="/">← card harness</a> · <a href="/lab">sound lab</a>
        </p>
        <div class="sources">
          <label>Open audio file…<input type="file" accept="audio/*" @change=${this.openFile} /></label>
          ${this.samples().map(
            ([name, url]) => html`<button @click=${() => this.loadUrl(url)}>Sample: ${name}</button>`
          )}
          ${this.error ? html`<span class="error">${this.error}</span>` : nothing}
        </div>
      </header>
      <main>
        <div>${this.renderCard()}</div>
        <section>${this.renderLab()}</section>
      </main>
    `;
  }

  // ---- card concept ---------------------------------------------------------

  private renderCard() {
    const voices = PRESETS.filter((p) => p.group === "voices");
    const places = PRESETS.filter((p) => p.group === "places");
    const chip = (p: { id: string; emoji: string; name: string }) => html`
      <button
        class="voice"
        ?data-on=${this.selected === p.id}
        ?data-busy=${this.busy === p.id}
        ?disabled=${!this.clip}
        title=${p.name}
        @click=${() => this.choose(p.id)}
      >
        <span class="e">${p.emoji}</span><span class="n">${p.name}</span>
      </button>`;
    return html`<div class="card">
      <h3>Voice changer</h3>
      <div class="core">
        <button class="mic" ?data-rec=${this.recording} @click=${this.toggleRecording} title="Record">
          ${this.recording ? "■" : "🎙"}
        </button>
        <div class="strip">
          ${this.recording
            ? html`<div class="meter"><div style="width:${Math.round(this.level * 100)}%"></div></div>
                <span class="text">${this.elapsed}s</span>`
            : html`<button
                  class="play"
                  ?disabled=${!this.clip}
                  @click=${() => this.preview(this.selected)}
                  title="Preview"
                >${this.playing ? "■" : "▶"}</button>
                <span class="text">${this.stripText()}</span>`}
        </div>
      </div>
      <div class="group">Voices</div>
      <div class="voices">
        ${chip({ id: "original", emoji: "🙂", name: "Original" })}
        ${voices.map(chip)}
      </div>
      <div class="group">Places</div>
      <div class="voices">${places.map(chip)}</div>
      <div class="send">
        <select @change=${(e: Event) => (this.speaker = (e.target as HTMLSelectElement).value)}>
          ${SPEAKERS.map((s) => html`<option ?selected=${s === this.speaker}>${s}</option>`)}
        </select>
        <button ?disabled=${!this.clip || !!this.busy && this.busy === this.selected} @click=${this.send}>Send</button>
      </div>
      <div class="cardstatus">${this.status}</div>
    </div>`;
  }

  private stripText(): string {
    if (!this.clip) return "Tap the mic and say something";
    const name = this.selected === "original" ? "Original" : PRESETS.find((p) => p.id === this.selected)?.name;
    if (this.busy === this.selected) return `Making ${name}…`;
    return `${name} · ${(this.clip.samples.length / this.clip.rate).toFixed(1)} s`;
  }

  private async choose(id: string): Promise<void> {
    this.selected = id;
    this.status = "";
    await this.preview(id, true);
  }

  /** Play the selected voice, rendering it first if it is not ready. */
  private async preview(id: string, restart = false): Promise<void> {
    if (this.playing && !restart) {
      this.player.pause();
      return;
    }
    this.player.pause();
    const url = id === "original" ? this.clipUrl : (await this.ensure(id))?.url;
    if (!url || this.selected !== id) return;
    this.player.src = url;
    this.player.currentTime = 0;
    await this.player.play().catch(() => undefined);
  }

  private async send(): Promise<void> {
    const id = this.selected;
    const result = id === "original" ? undefined : await this.ensure(id);
    const bytes = result?.bytes ?? (this.clip ? this.clip.samples.length * 2 + 44 : 0);
    const name = id === "original" ? "Original" : PRESETS.find((p) => p.id === id)?.name;
    this.status = `Mock send: ${name} → ${this.speaker} (${Math.round(bytes / 1024)} KB WAV, the same upload the broadcast card makes)`;
  }

  // ---- the lab --------------------------------------------------------------

  private renderLab() {
    if (!this.clip) {
      return html`<p class="lede">No take yet. Record in the card, open a file, or pick a sample.</p>
        ${this.renderNeural()}`;
    }
    const seconds = this.clip.samples.length / this.clip.rate;
    const groups: [Preset["group"], string][] = [
      ["voices", "Voices"],
      ["places", "Places and devices"],
      ["compare", "Engine comparison — the same change, different methods"],
    ];
    return html`
      <div class="facts">
        <span class="chip">${seconds.toFixed(1)} s</span>
        <span class="chip">${this.clip.rate / 1000} kHz</span>
        ${this.analysisNote ? html`<span class="chip">${this.analysisNote}</span>` : nothing}
      </div>
      <div class="row">
        <div><div class="title">🙂 Original</div><p>The take as recorded.</p></div>
        <audio controls preload="none" src=${this.clipUrl ?? ""}></audio>
      </div>
      ${groups.map(
        ([group, title]) => html`<h2>${title}</h2>
          ${PRESETS.filter((p) => p.group === group).map((p) => this.renderRow(p, seconds))}`
      )}
      ${this.renderNeural()}
    `;
  }

  private renderNeural() {
    const rows = typeof VOICE_NEURAL === "undefined" ? [] : VOICE_NEURAL;
    if (!rows.length) return nothing;
    return html`<h2>Neural voice conversion — rendered offline, not by this page</h2>
      <p class="lede">
        MeanVC2 (Apache-2.0) through onnxruntime: the voice of a different real
        person, from 12 s of their speech. Its source is the LibriSpeech sample above —
        load it to hear the DSP voices on the same take. 16 kHz output.
      </p>
      ${rows.map(
        (r) => html`<div class="row">
          <div><div class="title">🧠 ${r.name}</div><p>${r.note}</p></div>
          <audio controls preload="none" src=${r.url}></audio>
        </div>`
      )}`;
  }

  private renderRow(p: Preset, seconds: number) {
    const r = this.results.get(p.id);
    return html`<div class="row" ?data-on=${this.selected === p.id} data-id=${p.id}>
      <div>
        <div class="title">${p.emoji} ${p.name}</div>
        <p>${p.note}</p>
      </div>
      ${r
        ? html`<audio controls preload="none" src=${r.url}></audio>`
        : html`<span class="pending">${this.busy === p.id ? "rendering…" : "queued"}</span>`}
      <div class="meta">
        <span class="chip engine-${p.engine.kind}">${ENGINE_LABEL[p.engine.kind]}</span>
        ${p.fx?.length ? html`<span class="chip">${p.fx.map((f) => f.type).join(" → ")}</span>` : nothing}
        ${r
          ? html`<span class="chip">${Math.round(r.ms)} ms · ${(r.ms / 1000 / seconds).toFixed(2)}× real time</span>
              <span class="chip"><a href=${r.url} download="${p.id}.wav">wav</a></span>`
          : nothing}
      </div>
    </div>`;
  }

  // ---- sources --------------------------------------------------------------

  private samples(): [string, string][] {
    return typeof VOICE_SAMPLES === "undefined" ? [] : Object.entries(VOICE_SAMPLES);
  }

  private async toggleRecording(): Promise<void> {
    if (this.recording) {
      window.clearInterval(this.timer);
      this.recording = false;
      this.level = 0;
      this.setClip(await this.capture!.stop());
      return;
    }
    if (!Capture.isSupported()) {
      this.error = "The microphone needs a secure context: open this page on localhost.";
      return;
    }
    this.player.pause();
    this.capture = new Capture();
    try {
      await this.capture.start((level) => (this.level = level));
    } catch (error) {
      this.error = String(error);
      return;
    }
    this.error = "";
    this.recording = true;
    this.elapsed = 0;
    this.timer = window.setInterval(() => {
      this.elapsed += 1;
      if (this.elapsed >= 30) void this.toggleRecording();
    }, 1000);
  }

  private async openFile(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) await this.loadBlob(file);
  }

  async loadUrl(url: string): Promise<void> {
    await this.loadBlob(await (await fetch(url)).blob());
  }

  private async loadBlob(blob: Blob): Promise<void> {
    try {
      this.setClip(await decode(blob));
      this.error = "";
    } catch (error) {
      this.error = `Could not decode that file: ${error}`;
    }
  }

  private setClip(clip: Audio): void {
    for (const r of this.results.values()) URL.revokeObjectURL(r.url);
    if (this.clipUrl) URL.revokeObjectURL(this.clipUrl);
    this.generation++;
    this.results = new Map();
    this.clip = clip;
    this.clipUrl = URL.createObjectURL(toWav(clip));
    this.analysisNote = "";
    this.status = "";
    // Card voices first (what a user taps), then the comparison rows.
    this.queue = [
      ...PRESETS.filter((p) => p.group !== "compare"),
      ...PRESETS.filter((p) => p.group === "compare"),
    ].map((p) => p.id);
    const generation = this.generation;
    void analysisOf(clip).then((a) => {
      if (generation !== this.generation) return;
      const seconds = clip.samples.length / clip.rate;
      this.analysisNote = `vocoder analysis ${Math.round(a.ms)} ms (${(a.ms / 1000 / seconds).toFixed(2)}× RT) · median F0 ${Math.round(a.medianF0)} Hz`;
    });
    void this.drain();
  }

  // ---- rendering ------------------------------------------------------------

  /** Render `id` next (or now), and resolve when it is ready. */
  private ensure(id: string): Promise<Result | undefined> {
    const ready = this.results.get(id);
    if (ready) return Promise.resolve(ready);
    this.queue = [id, ...this.queue.filter((q) => q !== id)];
    void this.drain();
    return new Promise((resolve) => {
      const generation = this.generation;
      const check = () => {
        if (generation !== this.generation) return resolve(undefined);
        const r = this.results.get(id);
        if (r) resolve(r);
        else setTimeout(check, 50);
      };
      check();
    });
  }

  /** One render at a time: they all compete for the same thread. */
  private async drain(): Promise<void> {
    if (this.draining) return;
    this.draining = true;
    try {
      while (this.queue.length && this.clip) {
        const id = this.queue.shift()!;
        if (this.results.has(id)) continue;
        const preset = PRESETS.find((p) => p.id === id)!;
        const clip = this.clip;
        const generation = this.generation;
        this.busy = id;
        try {
          const { audio, ms } = await render(clip, preset);
          if (generation !== this.generation) continue;
          const wav = toWav(audio);
          this.results = new Map(this.results).set(id, {
            url: URL.createObjectURL(wav),
            bytes: wav.size,
            ms,
            seconds: audio.samples.length / audio.rate,
          });
        } catch (error) {
          console.error(`render ${id} failed`, error);
          this.error = `${preset.name}: ${error}`;
        }
      }
    } finally {
      this.busy = undefined;
      this.draining = false;
    }
  }

  /** For the headless check: every result's WAV, base64, once all are done. */
  async exportAll(): Promise<Record<string, { wav: string; ms: number }>> {
    while (this.draining || this.queue.length) await new Promise((r) => setTimeout(r, 100));
    const out: Record<string, { wav: string; ms: number }> = {};
    for (const [id, r] of this.results) {
      const bytes = new Uint8Array(await (await fetch(r.url)).arrayBuffer());
      let bin = "";
      for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      out[id] = { wav: btoa(bin), ms: r.ms };
    }
    return out;
  }
}

document.body.append(document.createElement("voice-lab"));
