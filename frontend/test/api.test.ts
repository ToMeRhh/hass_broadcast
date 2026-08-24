import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteMessage, listMessages, sendBroadcast, uploadRecording } from "../src/api";

function fakeHass() {
  return {
    connection: { sendMessagePromise: vi.fn().mockResolvedValue({ messages: [] }) },
    auth: { data: { access_token: "tok" } },
  } as any;
}

describe("api", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ message_id: "abc" }),
      }),
    );
  });

  it("uploads with a bearer token and returns the message id", async () => {
    const hass = fakeHass();
    const id = await uploadRecording(hass, new Blob(["x"]), 2.5);

    expect(id).toBe("abc");
    const [url, options] = (fetch as any).mock.calls[0];
    expect(url).toBe("/api/hass_broadcast/upload");
    expect(options.headers.Authorization).toBe("Bearer tok");
    expect(options.body.get("duration")).toBe("2.5");
  });

  it("throws when the upload is rejected", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 413 }));
    await expect(uploadRecording(fakeHass(), new Blob(["x"]), 1)).rejects.toThrow("413");
  });

  it("lists messages over the websocket", async () => {
    const hass = fakeHass();
    await listMessages(hass);
    expect(hass.connection.sendMessagePromise).toHaveBeenCalledWith({
      type: "hass_broadcast/list",
    });
  });

  it("returns can_delete on listed messages, not user_id", async () => {
    const hass = fakeHass();
    hass.connection.sendMessagePromise.mockResolvedValue({
      messages: [
        { id: "abc", created: "2026-08-21T00:00:00Z", duration: 2.5, can_delete: true, extension: "wav" },
      ],
    });
    const messages = await listMessages(hass);
    expect(messages[0].can_delete).toBe(true);
    expect((messages[0] as any).user_id).toBeUndefined();
  });

  it("deletes a message over the websocket", async () => {
    const hass = fakeHass();
    hass.connection.sendMessagePromise.mockResolvedValue({ deleted: true });
    expect(await deleteMessage(hass, "abc")).toBe(true);
    expect(hass.connection.sendMessagePromise).toHaveBeenCalledWith({
      type: "hass_broadcast/delete",
      message_id: "abc",
    });
  });

  it("resolves to deleted: false when the id does not exist, without throwing", async () => {
    const hass = fakeHass();
    hass.connection.sendMessagePromise.mockResolvedValue({ deleted: false });
    expect(await deleteMessage(hass, "missing")).toBe(false);
  });

  it("propagates a not_authorized websocket error when deletion is not permitted", async () => {
    const hass = fakeHass();
    hass.connection.sendMessagePromise.mockRejectedValue({
      code: "not_authorized",
      message: "You do not have permission to delete this recording",
    });
    await expect(deleteMessage(hass, "abc")).rejects.toMatchObject({ code: "not_authorized" });
  });

  it("sends a broadcast over the websocket", async () => {
    const hass = fakeHass();
    hass.connection.sendMessagePromise.mockResolvedValue({ failed: [] });

    await sendBroadcast(hass, "abc", ["media_player.kitchen"], "plain");

    expect(hass.connection.sendMessagePromise).toHaveBeenCalledWith({
      type: "hass_broadcast/send",
      message_id: "abc",
      targets: ["media_player.kitchen"],
      mode: "plain",
    });
  });

  it("includes volume in the payload when given", async () => {
    const hass = fakeHass();
    hass.connection.sendMessagePromise.mockResolvedValue({ failed: [] });

    await sendBroadcast(hass, "abc", ["media_player.kitchen"], "plain", 0.8);

    expect(hass.connection.sendMessagePromise).toHaveBeenCalledWith({
      type: "hass_broadcast/send",
      message_id: "abc",
      targets: ["media_player.kitchen"],
      mode: "plain",
      volume: 0.8,
    });
  });

  it("omits volume from the payload when not given", async () => {
    const hass = fakeHass();
    hass.connection.sendMessagePromise.mockResolvedValue({ failed: [] });

    await sendBroadcast(hass, "abc", ["media_player.kitchen"], "plain");

    const payload = hass.connection.sendMessagePromise.mock.calls[0][0];
    expect(payload).not.toHaveProperty("volume");
  });

  it("returns the targets the backend reported as failed", async () => {
    const hass = fakeHass();
    hass.connection.sendMessagePromise.mockResolvedValue({
      failed: ["media_player.broken"],
    });

    const result = await sendBroadcast(
      hass,
      "abc",
      ["media_player.kitchen", "media_player.broken"],
      "plain",
    );

    expect(result.failed).toEqual(["media_player.broken"]);
  });
});
