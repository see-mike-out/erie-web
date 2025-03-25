import TransformStreamManager from './streaming-audio-graph';
import { StreamingSpec } from './types/spec/streaming-data';
import { ConfigInterface, NormalizedSingleStream, ScaleType } from "./types";
import { validateScale } from './util';
import { normalizeSpecification } from './compile';

export async function startStreaming(audio_spec: StreamingSpec, options: ConfigInterface): Promise<TransformStreamManager> {
    // 1. Check for valid scale domain
    let scales = audio_spec.encoding?.scale?.scale;
    if (scales && !validateScale(scales)) {
        throw new Error("Invalid scale provided.");
    }

    // 2. Normalize spec
    const {  
        normalized, 
        tick, 
        synths, 
        samplings, 
        waves  
    } = await normalizeSpecification(audio_spec, options);

    // 3. Construct TransformStreamManager object
    const tsm = new TransformStreamManager(audio_spec, options, normalized, tick, synths, samplings, waves);

    // 4. Return configured object
    return tsm;

}
