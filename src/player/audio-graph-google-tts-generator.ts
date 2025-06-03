import * as tts from "@google-cloud/text-to-speech";
import {
  AudioGraphQueueItemText,
  AudioGraphSpeechItem,
  bcp47language,
  ConfigInterface
} from "../types";

const SSMLGENDERS = [`NEUTRAL`, `FEMALE`, `MALE`];

export async function GoogleCloudTTSGenerator(
  sound: AudioGraphSpeechItem | AudioGraphQueueItemText,
  config: ConfigInterface
  // @ts-ignore (this is typescript bug, works okay)
): Promise<string | Uint8Array<ArrayBufferLike> | null | undefined> {
  if (typeof window === 'undefined') {
    // node
    let speech = sound.speech;
    let lang = sound.language || config.language;
    let languageCode = bcp47language.includes(lang) ? lang : 'en-US';
    let ssmlGender = SSMLGENDERS.includes(config.ssmlGender) ? config.ssmlGender : 'NEUTRAL';
    let pitch = sound.pitch, speakingRate = sound.speechRate || config.speechRate || 1;
    const request = {
      input: { text: speech },
      voice: { languageCode, ssmlGender },
      audioConfig: { audioEncoding: config?.audioEncoding || 'MULAW', speakingRate, pitch },
    };
    const client = new tts.TextToSpeechClient();
    // Performs the text-to-speech request
    const [response] = await client.synthesizeSpeech(request);
    return response.audioContent;
  } else {
    console.warn("This function can only be run on node server environment");
    return null;
  }
}
