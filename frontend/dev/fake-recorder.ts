/**
 * Lets the harness record without a microphone.
 *
 * The card is only usable at all in a secure context: off `localhost` the
 * browser hides `getUserMedia`, `Recorder.isSupported()` returns false, and the
 * card replaces its whole recording UI with an error. That makes the redesign's
 * centrepiece — the record button and the level meter — impossible to look at on
 * a phone, which is exactly where it matters most.
 *
 * So patch `Recorder` itself: report support, drive the level callback with a
 * speech-shaped signal, and hand back synthetic audio of the right duration on
 * stop. Everything downstream (upload, history, playback, broadcast) then runs
 * for real, because to the card this is an ordinary recording.
 *
 * The patch is installed unconditionally and decides per call, so the panel
 * toggle takes effect immediately and real capture is untouched on localhost.
 */
import { Recorder } from "../src/recorder";
import { fakeSpeech } from "./mock-hass";

interface FakeSession {
  started: number;
  timer: number;
}

export interface RecorderMockOptions {
  /** True when the fake should stand in for the microphone. */
  useFake: () => boolean;
  /** True when recording should be refused, fake or real. */
  micDenied: () => boolean;
}

/** How often the fake pushes a level, matched roughly to the real worklet. */
const LEVEL_INTERVAL_MS = 50;

/**
 * A level that moves like a voice: syllables at a few hertz, brief pauses for
 * breath, and enough jitter that a meter animating off it looks alive rather
 * than like a test pattern.
 */
function speechLevel(elapsedSeconds: number): number {
  const syllables = Math.abs(Math.sin(elapsedSeconds * Math.PI * 2.4));
  const breathing = Math.sin(elapsedSeconds * 0.6) > 0.88 ? 0.06 : 1;
  const jitter = 0.75 + Math.random() * 0.25;
  return Math.min(1, 0.08 + 0.85 * syllables * breathing * jitter);
}

export function installRecorderMock(options: RecorderMockOptions): void {
  const originalIsSupported = Recorder.isSupported;
  const originalOnLevel = Recorder.prototype.onLevel;
  const originalStart = Recorder.prototype.start;
  const originalStop = Recorder.prototype.stop;

  // The level callback lives in a private field of the real recorder, so keep
  // our own copy rather than reaching into it.
  const callbacks = new WeakMap<Recorder, (level: number) => void>();
  const sessions = new WeakMap<Recorder, FakeSession>();

  Recorder.isSupported = () => options.useFake() || originalIsSupported();

  Recorder.prototype.onLevel = function (callback: (level: number) => void) {
    callbacks.set(this, callback);
    originalOnLevel.call(this, callback);
  };

  Recorder.prototype.start = async function (maxSeconds: number) {
    if (!options.useFake()) {
      return originalStart.call(this, maxSeconds);
    }
    if (options.micDenied()) {
      // The same rejection the browser gives, so the card's error mapping is
      // exercised rather than bypassed.
      throw new DOMException("Permission denied", "NotAllowedError");
    }
    // Acquiring a microphone is never instant; a start that resolves in the
    // same tick would hide any pending state the card wants to show.
    await new Promise((resolve) => setTimeout(resolve, 150));
    const started = Date.now();
    const callback = callbacks.get(this);
    sessions.set(this, {
      started,
      timer: window.setInterval(() => {
        callback?.(speechLevel((Date.now() - started) / 1000));
      }, LEVEL_INTERVAL_MS),
    });
  };

  Recorder.prototype.stop = async function () {
    const session = sessions.get(this);
    if (!session) {
      // No fake session — either real capture is running, or nothing is, and
      // the real stop() throws the "no active session" error the card relies on.
      return originalStop.call(this);
    }
    // Finish a fake session as a fake one even if the toggle flipped mid-take.
    window.clearInterval(session.timer);
    sessions.delete(this);
    callbacks.get(this)?.(0);
    const duration = (Date.now() - session.started) / 1000;
    return { blob: fakeSpeech(duration), duration };
  };
}

/**
 * Denies real microphone capture on demand. The fake path refuses in
 * `start()` above; this covers the case where the microphone is genuinely
 * available and we want to see the permission error anyway.
 */
export function installMicMock(isDenied: () => boolean): void {
  const media = navigator.mediaDevices;
  if (!media) {
    return;
  }
  const original = media.getUserMedia.bind(media);
  media.getUserMedia = async (constraints?: MediaStreamConstraints) => {
    if (isDenied()) {
      throw new DOMException("Permission denied", "NotAllowedError");
    }
    return original(constraints);
  };
}
