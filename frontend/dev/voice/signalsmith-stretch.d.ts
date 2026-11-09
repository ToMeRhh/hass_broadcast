// The package ships no types; this is the slice of its README the lab uses.
declare module "signalsmith-stretch" {
  interface StretchNode extends AudioWorkletNode {
    addBuffers(buffers: Float32Array[]): Promise<number>;
    schedule(change: {
      output?: number;
      active?: boolean;
      input?: number;
      rate?: number;
      semitones?: number;
      tonalityHz?: number;
      formantSemitones?: number;
      formantCompensation?: boolean;
      formantBaseHz?: number;
    }): void;
    latency(): Promise<number>;
  }
  export default function SignalsmithStretch(
    context: BaseAudioContext,
    options?: AudioWorkletNodeOptions,
  ): Promise<StretchNode>;
}
