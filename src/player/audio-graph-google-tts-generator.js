import * as tts from "@google-cloud/text-to-speech";
import { bcp47language } from "./audio-graph-player-proto";

export async function GoogleCloudTTSGenerator(sound, config, resolve, options) {
  if (typeof window === 'undefined') {
    // node
    let text = sound.speech;
    let languageCode = bcp47language.includes(sound.language) ? sound.language : 'en-US';
    let ssmlGender = config.ssmlGender || 'NEUTRAL';
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
    // resolve();
  } else {
    console.warn("This function can only be run on node server environment");
    resolve();
  }
}
