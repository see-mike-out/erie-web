import * as tts from "@google-cloud/text-to-speech";
import { bcp47language } from "./audio-graph-player-proto";

const SSMLGENDERS = [`NEUTRAL`, `FEMALE`, `MALE`];

export async function GoogleCloudTTSGenerator(sound, config) {
  if (typeof window === 'undefined') {
    // node
    let text = sound.speech;
    let lang = sound.language || config.language;
    let languageCode = bcp47language.includes(lang) ? lang : 'en-US';
    let ssmlGender = SSMLGENDERS.includes(config.ssmlGender) ? config.ssmlGender : 'NEUTRAL';
    let pitch = sound.pitch, speakingRate = sound.speechRate || config.speechRate || 1;
    const request = {
      input: { text: text },
      voice: { languageCode, ssmlGender },
      audioConfig: { audioEncoding: 'MP3', speakingRate, pitch },
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
