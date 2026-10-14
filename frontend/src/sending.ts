import { BroadcastMode, sendBroadcast, uploadRecording } from "./api";
import { Clip, storedId } from "./clip";

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
  /**
   * A fresh clip was just uploaded and now has this id. The caller swaps it
   * for a stored clip so a retry — or sending the same message to another
   * speaker — never uploads a second copy.
   */
  onStored?: (id: string) => void;
}

/** Upload the clip if it has never been, then play it on `targets`. */
export async function sendClip(options: SendOptions): Promise<Outcome> {
  const { hass, clip, targets } = options;
  let id = storedId(clip);
  if (id === undefined) {
    const blob = (clip.source as { kind: "fresh"; blob: Blob }).blob;
    id = await uploadRecording(hass, blob, clip.duration);
    options.onStored?.(id);
  }
  const { failed } = await sendBroadcast(
    hass,
    id,
    targets,
    options.mode,
    options.volume,
  );
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
