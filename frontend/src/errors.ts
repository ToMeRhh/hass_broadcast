export const INSECURE_CONTEXT_MESSAGE =
  "Recording needs a secure connection. Open Home Assistant over HTTPS " +
  "(or localhost) — plain http:// to a LAN address cannot use the microphone.";

/** Turn a getUserMedia rejection into something a user can act on. */
export function micErrorMessage(err: { name?: string; message?: string }): string {
  if (err?.name === "NotAllowedError") {
    return "Microphone permission was denied. Allow it for this site and try again.";
  }
  return `Could not start recording: ${err?.message ?? err?.name ?? "unknown error"}`;
}
