import { BroadcastMessage } from "./api";
import { BAR_COUNT, normalize, peaksOf, resample } from "./levels";

/**
 * Where a loaded clip's audio came from, which is the only thing that
 * differs between a message just recorded and one picked from history: a
 * fresh one has to be uploaded before it can be broadcast, a stored one is
 * already on the server and must never be uploaded again. A temporary one is
 * uploaded but expires on the server, so it keeps its blob to upload again.
 */
export type ClipSource =
  | { kind: "fresh"; blob: Blob }
  | { kind: "temporary"; id: string; blob: Blob }
  | { kind: "stored"; id: string };

/** The single recording the card currently holds. */
export interface Clip {
  source: ClipSource;
  /** Object URL for the in-card player. Revoke it when the clip is replaced. */
  url: string;
  duration: number;
  /** Waveform, one value per bar, 0..1. Empty when it could not be derived. */
  peaks: number[];
}

/** Turn a just-finished recording into a clip, with the waveform the recorder drew. */
export function freshClip(
  blob: Blob,
  duration: number,
  peaks: number[],
): Clip {
  return {
    source: { kind: "fresh", blob },
    url: URL.createObjectURL(blob),
    duration,
    peaks: normalize(resample(peaks, BAR_COUNT)),
  };
}

/** The message id a stored clip broadcasts directly, or undefined if not stored. */
export function storedId(clip: Clip): string | undefined {
  return clip.source.kind === "stored" ? clip.source.id : undefined;
}

/** The id of a clip that is on the server, saved or temporary. */
export function uploadedId(clip: Clip): string | undefined {
  return clip.source.kind === "fresh" ? undefined : clip.source.id;
}

export type PeakDecoder = (blob: Blob, count: number) => Promise<number[]>;

/**
 * Reduce encoded audio to one peak per bar.
 *
 * Used only for clips loaded from history: the recorder draws a fresh
 * recording's waveform from its samples. Goes through `decodeAudioData` because
 * the integration transcodes uploads to MP3 when ffmpeg is available, so the
 * bytes are not necessarily the WAV the card produced.
 */
export const decodePeaks: PeakDecoder = async (blob, count) => {
  const Ctor =
    (globalThis as any).AudioContext ?? (globalThis as any).webkitAudioContext;
  if (!Ctor) {
    return [];
  }
  const context = new Ctor();
  try {
    const buffer = await context.decodeAudioData(await blob.arrayBuffer());
    return peaksOf(buffer.getChannelData(0), count);
  } finally {
    // An AudioContext held open per history click would exhaust the browser's
    // limit after a few dozen loads.
    await context.close?.();
  }
};

/**
 * Load a stored recording into the card so it behaves like one just made.
 *
 * The media view is `requires_auth`, so pointing an `<audio>` at its URL
 * answers 401 — the bytes are fetched with the same bearer token the upload
 * uses and served to the player from an object URL.
 */
export async function loadStoredClip(
  hass: any,
  message: BroadcastMessage,
  decode: PeakDecoder = decodePeaks,
): Promise<Clip> {
  const response = await fetch(
    `/api/hass_broadcast/media/${message.id}.${message.extension}`,
    { headers: { Authorization: `Bearer ${hass.auth.data.access_token}` } },
  );
  if (!response.ok) {
    throw new Error(`Could not load that recording (${response.status})`);
  }
  const blob = await response.blob();
  let peaks: number[] = [];
  try {
    peaks = await decode(blob, BAR_COUNT);
  } catch {
    // A waveform we cannot draw is a cosmetic loss; the clip still plays and
    // still broadcasts, which is what the user asked for.
    peaks = [];
  }
  return {
    source: { kind: "stored", id: message.id },
    url: URL.createObjectURL(blob),
    duration: message.duration,
    peaks,
  };
}

/** Release a clip's object URL. Safe to call with nothing loaded. */
export function revokeClip(clip: Clip | undefined): void {
  if (clip) {
    URL.revokeObjectURL(clip.url);
  }
}
