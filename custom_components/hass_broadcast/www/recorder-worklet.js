// Emits Int16 PCM frames to the main thread. Loaded by URL: AudioWorklet
// modules run in a separate realm and cannot be bundled into the card.
class RecorderWorklet extends AudioWorkletProcessor {
  constructor() {
    super();
    // Recorder.stop() asks before closing the port. Messages arrive in order,
    // so this answer follows every chunk already posted.
    this.port.onmessage = () => this.port.postMessage("flushed");
  }

  process(inputs) {
    const channel = inputs[0]?.[0];
    if (!channel) {
      return true;
    }
    const pcm = new Int16Array(channel.length);
    for (let i = 0; i < channel.length; i++) {
      const clamped = Math.max(-1, Math.min(1, channel[i]));
      pcm[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
    }
    this.port.postMessage(pcm, [pcm.buffer]);
    return true;
  }
}

registerProcessor("recorder-worklet", RecorderWorklet);
