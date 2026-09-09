import { TTSProvider, Voice, SynthesizeOptions } from "../types";

export class BrowserTTSProvider implements TTSProvider {
  id = "browser";

  async synthesize(): Promise<ArrayBuffer | null> {
    return null; // handled client-side via speak()
  }

  speak(opts: SynthesizeOptions) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const utter = new SpeechSynthesisUtterance(opts.text);
    if (opts.speed) utter.rate = opts.speed;
    if (opts.pitch) utter.pitch = opts.pitch;
    if (opts.voice) {
      const match = window.speechSynthesis.getVoices().find((v) => v.name === opts.voice);
      if (match) utter.voice = match;
    }
    window.speechSynthesis.speak(utter);
  }

  async getVoices(): Promise<Voice[]> {
    if (typeof window === "undefined" || !window.speechSynthesis) return [];
    return window.speechSynthesis.getVoices().map((v) => ({
      id: v.name,
      name: v.name,
      language: v.lang,
    }));
  }

  supports(): boolean {
    return typeof window !== "undefined" && !!window.speechSynthesis;
  }
}
