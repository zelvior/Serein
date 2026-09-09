export interface Voice {
  id: string;
  name: string;
  language: string;
}

export interface SynthesizeOptions {
  text: string;
  voice?: string;
  speed?: number;
  pitch?: number;
}

export interface TTSProvider {
  id: string;
  synthesize(opts: SynthesizeOptions): Promise<ArrayBuffer | null>;
  getVoices(): Promise<Voice[]>;
  supports(language: string): boolean;
}
