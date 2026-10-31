import {
  BroadcastMode,
  BroadcastResult,
  sendBroadcast,
  uploadRecording,
} from "./api";
import { Clip, ClipSource } from "./clip";

/** How a broadcast went, from the user's point of view. */
export type Outcome =
  | { kind: "sent"; targets: string[] }
  | { kind: "partial"; failed: string[] }
  | { kind: "failed"; failed: string[] };

/** What a status line says about something. */
export interface Status {
  kind: "error" | "info";
  text: string;
  /** Stays until the next attempt instead of timing out. */
  sticky?: boolean;
}

export interface SendOptions {
  hass: any;
  clip: Clip;
  targets: string[];
  mode: BroadcastMode;
  volume?: number;
  /** Keep the message in history; otherwise it is uploaded as temporary. */
  keep: boolean;
  /**
   * The clip was just uploaded and now lives at this source. The caller swaps
   * it in so a retry — or sending the same message to another speaker —
   * never uploads a second copy.
   */
  onStored?: (source: ClipSource) => void;
}

/** Upload the clip if it has never been, then play it on `targets`. */
export async function sendClip(options: SendOptions): Promise<Outcome> {
  const { hass, clip, targets, keep } = options;
  const upload = async (blob: Blob): Promise<string> => {
    const id = await uploadRecording(hass, blob, clip.duration, !keep);
    options.onStored?.(keep ? { kind: "stored", id } : { kind: "temporary", id, blob });
    return id;
  };
  const play = (id: string) =>
    sendBroadcast(hass, id, targets, options.mode, options.volume);

  const { source } = clip;
  let result: BroadcastResult;
  if (source.kind === "fresh") {
    result = await play(await upload(source.blob));
  } else if (source.kind === "temporary") {
    try {
      result = await play(source.id);
    } catch (err: any) {
      // The server forgot it (expired, or restarted): the blob is still here.
      if (err?.code !== "not_found") {
        throw err;
      }
      result = await play(await upload(source.blob));
    }
  } else {
    result = await play(source.id);
  }
  const { failed } = result;
  if (failed.length === 0) {
    return { kind: "sent", targets };
  }
  return failed.length >= targets.length
    ? { kind: "failed", failed }
    : { kind: "partial", failed };
}

/** Name entity ids the way the picker does, so a warning is readable. */
export function describeTargets(hass: any, entityIds: string[]): string {
  return entityIds
    .map(
      (entityId) =>
        hass?.states?.[entityId]?.attributes?.friendly_name ?? entityId,
    )
    .join(", ");
}

export function outcomeStatus(hass: any, outcome: Outcome): Status {
  switch (outcome.kind) {
    case "sent":
      return { kind: "info", text: `Sent to ${describeTargets(hass, outcome.targets)}` };
    case "partial":
      return {
        kind: "error",
        text: `Played, but not on ${describeTargets(hass, outcome.failed)}.`,
      };
    case "failed":
      return {
        kind: "error",
        text: `Could not play on any speaker: ${describeTargets(hass, outcome.failed)}.`,
      };
  }
}
