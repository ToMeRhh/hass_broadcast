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
  temporary = false,
): Promise<string> {
  const body = new FormData();
  body.append("file", blob, "recording.wav");
  body.append("duration", String(duration));
  if (temporary) {
    body.append("temporary", "1");
  }

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

/**
 * Promotes a temporary recording to a saved one. Rejects with the websocket
 * error object (e.g. `{ code: "not_found" }` once it has expired), as
 * `deleteMessage` does.
 */
export async function saveRecording(hass: any, id: string): Promise<void> {
  await hass.connection.sendMessagePromise({
    type: "hass_broadcast/save",
    message_id: id,
  });
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
  volume?: number,
): Promise<BroadcastResult> {
  const result = await hass.connection.sendMessagePromise({
    type: "hass_broadcast/send",
    message_id: id,
    targets,
    mode,
    ...(volume !== undefined ? { volume } : {}),
  });
  return { failed: result.failed };
}
