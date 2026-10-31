import { ReactiveController, ReactiveControllerHost } from "lit";

import { micErrorMessage } from "./errors";
import { LevelEnvelope } from "./levels";
import { Recorder, STOP_TAIL_MS } from "./recorder";

// "finishing" runs from the release until the take is ready: Recorder.stop()
// records on past it, but the button is already let go.
export type Phase = "idle" | "recording" | "finishing" | "sending";
export type RecordMode = "push_to_talk" | "start_stop";

/** Below this, a push-to-talk press is a mis-tap rather than a message. */
export const MIN_PRESS_SECONDS = 0.4;
// What a take that short comes back as: stop() records on past the release.
const MIN_TAKE_SECONDS = MIN_PRESS_SECONDS + STOP_TAIL_MS / 1000;

/** One finished recording, before anything has decided what to do with it. */
export interface Take {
  blob: Blob;
  duration: number;
  /** The waveform, drawn from the recorded audio. */
  peaks: number[];
}

export interface RecordingOptions {
  recordMode: () => RecordMode;
  /** Seconds after which a take stops on its own. */
  maxDuration: () => number;
  /** Whether the browser should suppress background noise; off when omitted. */
  noiseSuppression?: () => boolean;
  /** A take finished and is long enough to keep. */
  onTake: (take: Take) => void | Promise<void>;
  /** Something went wrong. `sticky` errors stay until the next attempt. */
  onError: (text: string, sticky: boolean) => void;
  /** A take is starting; the host clears whatever it was saying. */
  onStart?: () => void;
  /** A press ended in a discard: the take is gone and nothing else happens. */
  onDiscard?: () => void;
}

/**
 * The microphone half of the card: who may start and stop a take, when, and
 * what happens to the session if the element goes away mid-gesture.
 *
 * Shared by the card and the tile, which differ only in what they do with a
 * finished take (`onTake`). Fields are plain properties; every mutation asks
 * the host to re-render.
 */
export class RecordingController implements ReactiveController {
  phase: Phase = "idle";
  /** Whole seconds into the current take. */
  elapsed = 0;
  /** The latest windowed peak, 0..1 — what the mic animation follows. */
  level = 0;

  recorder = new Recorder();
  private envelope = new LevelEnvelope();
  private timer?: number;
  // Guards Recorder.start()/stop() against re-entrant calls — e.g. a
  // double-tap on the record button, or the max-duration timer firing at
  // the same moment as a manual stop. Recorder.stop() throws when there is
  // no active recording session, so these transitions must not race.
  private busy = false;
  // Set in hostDisconnected. That teardown only fires for
  // phase === "recording", but during start() the phase is still "idle", so a
  // teardown mid-start would be skipped entirely and startRecording would
  // resume on a detached element — holding the microphone open and installing
  // an interval that keeps the dead element alive.
  private disconnected = false;
  /** Set when the button is released before start() has resolved. */
  private stopRequested = false;
  /** That early release asked for the take to be thrown away. */
  private discardRequested = false;

  constructor(
    private host: ReactiveControllerHost,
    private options: RecordingOptions,
  ) {
    host.addController(this);
  }

  get supported(): boolean {
    return Recorder.isSupported();
  }

  hostConnected(): void {
    // Reset for a re-attach (dashboard navigation moves the element rather
    // than recreating it).
    this.disconnected = false;
  }

  hostDisconnected(): void {
    this.disconnected = true;
    this.clearTimer();
    // Torn down (dashboard navigation, view switch) while a recording is in
    // progress. The MediaStream/AudioContext/worklet node stay alive until
    // something calls Recorder.stop() — there is no side-effect-free
    // "abandon" method — so call stop() here and discard the blob rather than
    // leaking the mic open until a page reload. Skip this when `busy` is
    // already true: a start()/stop() is already in flight and will release
    // the session itself once its own promise settles — calling stop() again
    // here would race it and hit Recorder.stop()'s own "no active session"
    // throw.
    if (this.phase === "recording" && !this.busy) {
      this.phase = "idle";
      this.level = 0;
      this.release();
    }
  }

  /** Mark a broadcast as in flight (or finished); blocks new takes meanwhile. */
  setSending(sending: boolean): void {
    this.phase = sending ? "sending" : "idle";
    this.host.requestUpdate();
  }

  /**
   * Pointer down on the record button. In start-stop this is the whole
   * interaction; in push-to-talk it opens the microphone and `onPressEnd`
   * closes it.
   */
  async onPressStart(event: Event): Promise<void> {
    if (this.phase === "sending" || !this.supported) {
      return;
    }
    if (this.options.recordMode() === "start_stop") {
      await (this.phase === "recording"
        ? this.stopRecording()
        : this.startRecording());
      return;
    }
    // Without this a long press on a phone selects text, opens the context
    // menu, or starts a scroll — all of which cancel the gesture mid-message.
    // Scoped to push-to-talk: in start-stop a plain click already works, and
    // calling it unconditionally stopped the button ever taking focus there.
    event.preventDefault();
    if (this.busy) {
      // A second pointer (e.g. another finger) landed while this press's own
      // start()/stop() is still in flight. Handling it as a normal press
      // would reset stopRequested below and clobber the first press's pending
      // stop, or open a second concurrent recording session.
      return;
    }
    this.stopRequested = false;
    this.discardRequested = false;
    await this.startRecording();
    // Released while the microphone was still opening: stop now that there
    // is a session to stop.
    if (this.stopRequested && this.phase === "recording") {
      await (this.discardRequested ? this.discard() : this.stopRecording());
    }
  }

  /**
   * Pointer up or cancel, or the host calling the press off. Only
   * push-to-talk cares. `discard` throws the take away instead of handing it
   * over.
   */
  async onPressEnd(discard = false): Promise<void> {
    if (this.options.recordMode() !== "push_to_talk") {
      return;
    }
    if (this.phase !== "recording") {
      this.stopRequested = true;
      this.discardRequested = discard;
      return;
    }
    await (discard ? this.discard() : this.stopRecording());
  }

  /**
   * End the take and throw it away. Ready at once: nobody wants the tail
   * that stop() records past the release, so it is not waited for.
   */
  private discard(): void {
    if (this.busy || this.phase !== "recording") {
      return;
    }
    this.clearTimer();
    this.phase = "idle";
    this.level = 0;
    this.release();
    this.options.onDiscard?.();
    this.host.requestUpdate();
  }

  async startRecording(): Promise<void> {
    // Ignore a re-entrant call (double-tap) while a start/stop is already in
    // flight, or if we are already recording or sending.
    if (this.busy || this.phase !== "idle") {
      return;
    }
    this.busy = true;
    this.options.onStart?.();
    try {
      this.recorder.onLevel((level) => {
        if (this.phase !== "recording") {
          return;
        }
        if (this.envelope.push(level, Date.now())) {
          this.level = this.envelope.tail(1)[0];
          this.host.requestUpdate();
        }
      });
      this.envelope.reset();
      await this.recorder.start(this.options.maxDuration(), {
        noiseSuppression: this.options.noiseSuppression?.() ?? false,
      });
    } catch (err: any) {
      // A denied permission stays denied until the user changes it, so it
      // stays on screen rather than timing out under them.
      this.options.onError(micErrorMessage(err), err?.name === "NotAllowedError");
      this.host.requestUpdate();
      return;
    } finally {
      this.busy = false;
    }

    // Torn down while start() was in flight. hostDisconnected already ran
    // (clearTimer with it), so transitioning here would strand a detached
    // element with a live interval and the microphone held open until the
    // max-duration timer fired. Release the session instead.
    if (this.disconnected) {
      this.release();
      return;
    }

    this.phase = "recording";
    this.elapsed = 0;
    this.level = 0;
    this.host.requestUpdate();
    const limit = this.options.maxDuration();
    this.timer = window.setInterval(() => {
      this.elapsed += 1;
      this.host.requestUpdate();
      if (this.elapsed >= limit) {
        void this.stopRecording();
      }
    }, 1000);
  }

  async stopRecording(): Promise<void> {
    // Recorder.stop() throws when there is no active recording session.
    // Guard against double-taps on the stop button and against the
    // max-duration timer firing at the same instant as a manual stop — both
    // would otherwise call stop() twice for one recording.
    if (this.busy || this.phase !== "recording") {
      return;
    }
    this.busy = true;
    this.clearTimer();
    this.phase = "finishing";
    this.level = 0;
    this.host.requestUpdate();
    let take: Take | undefined;
    try {
      const { blob, duration, peaks } = await this.recorder.stop();
      this.phase = "idle";
      if (
        this.options.recordMode() === "push_to_talk" &&
        duration < MIN_TAKE_SECONDS
      ) {
        // A tap, not a message. Saying so beats loading a clip of silence
        // that the user then has to work out how to get rid of.
        this.options.onError("Hold the button while you speak.", false);
      } else {
        take = { blob, duration, peaks };
      }
    } catch (err: any) {
      // Don't strand the UI showing "recording" over a dead session — a
      // second tap would just hit Recorder.stop()'s own "no active session"
      // throw again. Whatever went wrong, the recording is gone either way,
      // so surface it and reset to idle.
      this.phase = "idle";
      this.options.onError(
        `Could not finish recording: ${err?.message ?? err}`,
        false,
      );
    } finally {
      this.busy = false;
      this.level = 0;
      this.host.requestUpdate();
    }
    if (take) {
      await this.options.onTake(take);
    }
  }

  private clearTimer(): void {
    if (this.timer !== undefined) {
      window.clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  /** Stop a session whose result nobody wants any more. */
  private release(): void {
    this.busy = true;
    // Fire-and-forget: teardown is synchronous and cannot be awaited. The
    // rejection is still handled so it can never surface as unhandled.
    this.recorder
      .stop()
      .catch(() => {
        // Nothing left to recover into once the element is torn down.
      })
      .finally(() => {
        this.busy = false;
      });
  }
}
