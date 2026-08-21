import { describe, expect, it } from "vitest";
import { encodeWav } from "../src/wav";

async function headerOf(blob: Blob) {
  const buf = await blob.arrayBuffer();
  return { view: new DataView(buf), size: buf.byteLength };
}

describe("encodeWav", () => {
  it("writes a RIFF/WAVE header", async () => {
    const { view } = await headerOf(encodeWav(new Int16Array(10), 16000));
    const tag = (o: number) =>
      String.fromCharCode(view.getUint8(o), view.getUint8(o + 1), view.getUint8(o + 2), view.getUint8(o + 3));
    expect(tag(0)).toBe("RIFF");
    expect(tag(8)).toBe("WAVE");
    expect(tag(12)).toBe("fmt ");
    expect(tag(36)).toBe("data");
  });

  it("describes 16-bit mono PCM at the given sample rate", async () => {
    const { view } = await headerOf(encodeWav(new Int16Array(10), 16000));
    expect(view.getUint16(20, true)).toBe(1); // PCM
    expect(view.getUint16(22, true)).toBe(1); // mono
    expect(view.getUint32(24, true)).toBe(16000); // sample rate
    expect(view.getUint32(28, true)).toBe(32000); // byte rate
    expect(view.getUint16(32, true)).toBe(2); // block align
    expect(view.getUint16(34, true)).toBe(16); // bits per sample
  });

  it("sizes the file as 44 header bytes plus two bytes per sample", async () => {
    const { view, size } = await headerOf(encodeWav(new Int16Array(100), 16000));
    expect(size).toBe(44 + 200);
    expect(view.getUint32(4, true)).toBe(36 + 200);
    expect(view.getUint32(40, true)).toBe(200);
  });

  it("preserves sample values", async () => {
    const samples = Int16Array.from([0, 1000, -1000, 32767, -32768]);
    const { view } = await headerOf(encodeWav(samples, 16000));
    for (let i = 0; i < samples.length; i++) {
      expect(view.getInt16(44 + i * 2, true)).toBe(samples[i]);
    }
  });

  it("produces an audio/wav blob", () => {
    expect(encodeWav(new Int16Array(4), 16000).type).toBe("audio/wav");
  });
});
