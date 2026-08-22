/**
 * A fake `hass` object plus fake HTTP endpoints, covering exactly the surface
 * the card touches:
 *
 *   hass.states                         — entity list, for the speaker picker
 *   hass.callService(...)               — hass_broadcast.send
 *   hass.connection.sendMessagePromise  — hass_broadcast/list and /delete
 *   hass.auth.data.access_token         — the bearer token the upload sends
 *   fetch /api/hass_broadcast/upload    — stores the blob, returns an id
 *   fetch /api/hass_broadcast/media/... — serves a stored blob back
 *
 * The upload/media round-trip is real (in memory), so a recording made here can
 * be listed, fetched back and played exactly as it would be on a live install.
 */
import { encodeWav } from "../src/wav";
import type { BroadcastMessage } from "../src/api";

const SUPPORT_PLAY_MEDIA = 512;
const SUPPORT_VOLUME_SET = 4;

export type BroadcastOutcome = "ok" | "partial" | "all-fail";
export type HistorySize = "seeded" | "empty" | "many";

export interface Scenario {
  /** getUserMedia rejects with NotAllowedError. */
  micDenied: boolean;
  /** POST /upload answers 500. */
  uploadFails: boolean;
  /** hass_broadcast.send throws instead of answering. */
  sendThrows: boolean;
  /** Which targets the send reports as failed. */
  broadcast: BroadcastOutcome;
  /** hass_broadcast/delete rejects with not_authorized. */
  deleteForbidden: boolean;
  history: HistorySize;
  /** Milliseconds of fake latency on every call, to see pending states. */
  latency: number;
}

export const DEFAULT_SCENARIO: Scenario = {
  micDenied: false,
  uploadFails: false,
  sendThrows: false,
  broadcast: "ok",
  deleteForbidden: false,
  history: "seeded",
  latency: 250,
};

interface FakeEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
}

function entity(
  entity_id: string,
  friendly_name: string,
  state: string,
  supported_features: number,
): FakeEntity {
  return {
    entity_id,
    state,
    attributes: { friendly_name, supported_features },
  };
}

/**
 * A deliberately awkward speaker list: long names, an unavailable player, a
 * couple that cannot play media at all (the card must filter those out), and
 * enough entries that a naive layout overflows.
 */
export const FAKE_ENTITIES: FakeEntity[] = [
  entity("media_player.kitchen", "Kitchen", "playing", SUPPORT_PLAY_MEDIA | SUPPORT_VOLUME_SET),
  entity("media_player.living_room", "Living Room", "idle", SUPPORT_PLAY_MEDIA | SUPPORT_VOLUME_SET),
  entity("media_player.bedroom", "Bedroom", "off", SUPPORT_PLAY_MEDIA),
  entity("media_player.kids_room", "Kids' Room Nest Mini", "idle", SUPPORT_PLAY_MEDIA),
  entity("media_player.office_desk", "Office Desk Speaker (upstairs)", "paused", SUPPORT_PLAY_MEDIA),
  entity("media_player.bathroom", "Bathroom", "unavailable", SUPPORT_PLAY_MEDIA),
  entity("media_player.garage", "Garage", "idle", SUPPORT_PLAY_MEDIA),
  entity("media_player.balcony", "Balcony", "idle", SUPPORT_PLAY_MEDIA),
  // No play_media support: these must never appear in the picker.
  entity("media_player.tv_remote", "Living Room TV", "on", SUPPORT_VOLUME_SET),
  entity("media_player.old_receiver", "Hi-Fi Receiver", "off", 0),
];

/** A short tone, so seeded history entries actually play something. */
function fakeAudio(seconds: number, hz: number): Blob {
  const rate = 16000;
  const samples = new Int16Array(Math.round(rate * seconds));
  for (let i = 0; i < samples.length; i++) {
    // Fade the tone out so it sounds like speech ending, not a hard clip.
    const fade = 1 - i / samples.length;
    samples[i] = Math.round(Math.sin((2 * Math.PI * hz * i) / rate) * 8000 * fade);
  }
  return encodeWav(samples, rate);
}

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 3600_000).toISOString();
}

function seedHistory(size: HistorySize): BroadcastMessage[] {
  if (size === "empty") {
    return [];
  }
  const base: BroadcastMessage[] = [
    { id: "seed-1", created: hoursAgo(0.4), duration: 3.2, can_delete: true, extension: "wav" },
    { id: "seed-2", created: hoursAgo(5), duration: 8.7, can_delete: true, extension: "wav" },
    { id: "seed-3", created: hoursAgo(26), duration: 1.4, can_delete: false, extension: "wav" },
  ];
  if (size === "seeded") {
    return base;
  }
  return [
    ...base,
    ...Array.from({ length: 9 }, (_, i) => ({
      id: `seed-${i + 4}`,
      created: hoursAgo(30 + i * 7),
      duration: 2 + (i % 5) * 3.5,
      can_delete: i % 3 !== 0,
      extension: "wav" as const,
    })),
  ];
}

/** Backing store shared by the fake websocket calls and the fake HTTP endpoints. */
export class MockBackend {
  messages: BroadcastMessage[] = [];
  private audio = new Map<string, Blob>();
  private counter = 0;

  constructor(private scenario: Scenario) {
    this.reseed();
  }

  setScenario(scenario: Scenario): void {
    this.scenario = scenario;
  }

  reseed(): void {
    this.messages = seedHistory(this.scenario.history);
    this.audio.clear();
    this.messages.forEach((message, index) => {
      this.audio.set(message.id, fakeAudio(Math.min(message.duration, 4), 320 + index * 40));
    });
  }

  private delay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this.scenario.latency));
  }

  async upload(blob: Blob, duration: number): Promise<string> {
    await this.delay();
    if (this.scenario.uploadFails) {
      throw new Error("upload-failed");
    }
    const id = `rec-${++this.counter}`;
    this.audio.set(id, blob);
    this.messages = [
      { id, created: new Date().toISOString(), duration, can_delete: true, extension: "wav" },
      ...this.messages,
    ];
    return id;
  }

  mediaFor(id: string): Blob | undefined {
    return this.audio.get(id);
  }

  async list(): Promise<BroadcastMessage[]> {
    await this.delay();
    return this.messages;
  }

  async remove(id: string): Promise<boolean> {
    await this.delay();
    if (this.scenario.deleteForbidden) {
      // Matches the shape the websocket layer rejects with.
      throw { code: "not_authorized", message: "unauthorized" };
    }
    const before = this.messages.length;
    this.messages = this.messages.filter((message) => message.id !== id);
    this.audio.delete(id);
    return this.messages.length !== before;
  }

  async send(targets: string[]): Promise<{ response: { failed: string[] } }> {
    await this.delay();
    if (this.scenario.sendThrows) {
      throw new Error("Speaker is unreachable");
    }
    if (this.scenario.broadcast === "all-fail") {
      return { response: { failed: [...targets] } };
    }
    if (this.scenario.broadcast === "partial") {
      // Fail every other target, so the message names some but not all.
      return { response: { failed: targets.filter((_, index) => index % 2 === 0) } };
    }
    return { response: { failed: [] } };
  }
}

export function createMockHass(backend: MockBackend): any {
  const states: Record<string, FakeEntity> = {};
  for (const item of FAKE_ENTITIES) {
    states[item.entity_id] = item;
  }
  return {
    states,
    themes: {},
    language: "en",
    locale: { language: "en" },
    auth: { data: { access_token: "fake-dev-token" } },
    connection: {
      sendMessagePromise: async (message: any) => {
        if (message.type === "hass_broadcast/list") {
          return { messages: await backend.list() };
        }
        if (message.type === "hass_broadcast/delete") {
          return { deleted: await backend.remove(message.message_id) };
        }
        throw new Error(`mock hass: unhandled websocket message ${message.type}`);
      },
    },
    callService: async (
      domain: string,
      service: string,
      data: any,
      _target: unknown,
      _notifyOnError: unknown,
      _returnResponse: unknown,
    ) => {
      if (domain === "hass_broadcast" && service === "send") {
        return backend.send(data.targets ?? []);
      }
      throw new Error(`mock hass: unhandled service ${domain}.${service}`);
    },
  };
}

/**
 * Routes the card's two HTTP calls at the in-memory backend. Everything else
 * (the bundle, the worklet) falls through to the dev server untouched.
 */
export function installFetchMock(backend: MockBackend): void {
  const original = window.fetch.bind(window);
  window.fetch = async (input: any, init?: any) => {
    const url = typeof input === "string" ? input : (input?.url ?? String(input));

    if (url.includes("/api/hass_broadcast/upload")) {
      const body = init?.body as FormData;
      try {
        const id = await backend.upload(
          body.get("file") as Blob,
          Number(body.get("duration")),
        );
        return new Response(JSON.stringify({ message_id: id }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch {
        return new Response("upload failed", { status: 500 });
      }
    }

    const media = /\/api\/hass_broadcast\/media\/([^./]+)\./.exec(url);
    if (media) {
      const blob = backend.mediaFor(media[1]);
      return blob
        ? new Response(blob, { status: 200, headers: { "Content-Type": "audio/wav" } })
        : new Response("not found", { status: 404 });
    }

    return original(input, init);
  };
}

/**
 * Lets the harness force a microphone denial. Real capture is used otherwise —
 * localhost is a secure context, so the worklet and WAV encoder run for real.
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
