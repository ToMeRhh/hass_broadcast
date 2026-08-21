export interface BroadcastMessage {
  id: string;
  created: string;
  duration: number;
  /** Server-computed: true if the current user may delete this recording
   *  (owner, or admin). The server is the authority — do not re-derive this
   *  client-side. */
  can_delete: boolean;
  extension: string;
}

export type BroadcastMode = "plain" | "restore" | "chime";

export async function uploadRecording(
  hass: any,
  blob: Blob,
  duration: number,
): Promise<string> {
  const body = new FormData();
  body.append("file", blob, "recording.wav");
  body.append("duration", String(duration));

  const response = await fetch("/api/hass_broadcast/upload", {
    method: "POST",
    body,
    headers: { Authorization: `Bearer ${hass.auth.data.access_token}` },
  });

  if (!response.ok) {
    throw new Error(`Upload failed (${response.status})`);
  }
  return (await response.json()).message_id;
}

export async function listMessages(hass: any): Promise<BroadcastMessage[]> {
  const result = await hass.connection.sendMessagePromise({
    type: "hass_broadcast/list",
  });
  return result.messages;
}

/**
 * Deletes a recording. Resolves `true`/`false` for a successful server
 * response (`false` means the id did not exist — not an error). Rejects
 * with the websocket error object (e.g. `{ code: "not_authorized" }`) when
 * the recording exists but this user may not delete it; callers should
 * handle that case explicitly rather than letting it fail silently.
 */
export async function deleteMessage(hass: any, id: string): Promise<boolean> {
  const result = await hass.connection.sendMessagePromise({
    type: "hass_broadcast/delete",
    message_id: id,
  });
  return result.deleted;
}

/** Per-target outcome of one broadcast. `failed` lists the entity ids that
 *  could not play it; the remaining targets did play. */
export interface BroadcastResult {
  failed: string[];
}

export async function sendBroadcast(
  hass: any,
  id: string,
  targets: string[],
  mode: BroadcastMode,
): Promise<BroadcastResult> {
  const result = await hass.callService(
    "hass_broadcast",
    "send",
    { message_id: id, targets, mode },
    undefined, // target: entities are passed in the service data
    undefined, // notifyOnError: keep the caller's default
    true, // returnResponse: we need the per-target results
  );
  // Defensive: an older frontend that ignores `returnResponse` gives us no
  // response at all. Treat "no information" as "nothing reported failed"
  // rather than inventing failures.
  const failed = result?.response?.failed;
  return { failed: Array.isArray(failed) ? failed : [] };
}
