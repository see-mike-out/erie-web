import {
    SequenceStream,
    OverlayStream,
    isRepeatedStream,
    compileSingleLayerAuidoGraph,
    UnitStream
} from './compile';
import { applyTransforms } from "./data";
import { 
    ConfigInterface, 
    NormalizedStreamItem,
    TickObject,
    SynthObject,
    SampledToneObject,
    WaveObject,
    DataSpec,
    RecordObject,
    AudioGraph,
    PreGraphItem,
    AudioGraphQueueItem
} from "./types";
import { StreamingSpec } from "./types/spec/streaming-data";
import { toHashedObject } from "./util";
import { rampBy } from "./player";
// import { InstrumentNode } from './types';
import { AudioGraphQueue } from './player';

class TimestampedData<T extends object> {
    private _data: T;
    private _timestamp: number;

    constructor(data: T) {
        this._data = data;
        this._timestamp = Date.now();
    }

    get data(): T {
        return this._data;
    }

    get timestamp(): number {
        return this._timestamp;
    }
}

class TransformStreamManager {
    private audio_spec: StreamingSpec;
    private options: ConfigInterface;
    private transformSpec: any;
    private testData?: DataSpec;
    private tick: any;
    private synths: any;
    private samplings: any;
    private waves: any;
    private scales: any;
    private dataBuffer: TimestampedData<any>[];
    private MAX_DATA_POINTS: number = 100;
    private MAX_TIME_MS: number = 5000; // Default 5 seconds in milliseconds
    private hasBaseTone: boolean;
    private baseTone: any;
    private audioGraphQueue: AudioGraphQueue;

    // write async function that returns class, given the spec and config
    //  runs normalization first
    //  puts the output into class constructor
    //  acts as wrapper function
    //  think of pandasread(file) type of function
    constructor(audio_spec: StreamingSpec, 
        options: ConfigInterface,
        normalized: NormalizedStreamItem[],
        tick: TickObject,
        synths: SynthObject[],
        samplings: SampledToneObject[],
        waves: WaveObject[]) {
            
        this.audio_spec = audio_spec;
        this.options = options;
        this.transformSpec = normalized;
        this.testData = audio_spec.data.test;
        this.tick = tick;
        this.synths = synths;
        this.samplings = samplings;
        this.waves = waves;
        this.dataBuffer = [];

        // user specified playback as 'data points'
        if (this.audio_spec.playback?.playback_unit == 'data points' && audio_spec.playback?.playback_num) {
            this.MAX_DATA_POINTS = audio_spec.playback?.playback_num;
        } else if (this.audio_spec.playback?.playback_unit == 'time' && audio_spec.playback?.playback_num) {
            // user specified playback as 'time'
            // convert to ms
            this.MAX_TIME_MS = (audio_spec.playback?.playback_num || 5) * 1000;
        }
        this.hasBaseTone = audio_spec.tone.continued;
        this.baseTone = this.generateBaseTone();

        this.audioGraphQueue = new AudioGraphQueue();


    }

    async transformAndOutput() {
        let sequence = new SequenceStream();
        this.setupSequence(sequence);
        
        // Add the base tone to the sequence
        if (this.hasBaseTone) {
            sequence.addStream(this.baseTone);
        }

        if (this.testData) {
            this.processTransformedData(this.testData, sequence);
        } 
        // TODO: insert listener for incoming data
        for await (const rawData of LISTENER_FOR_DATA_HERE) {
            this.processTransformedData(rawData, sequence);
        }
        
        return sequence;
    }

    async processTransformedData(rawData: any, sequence: any) {
        const transformedData = applyTransforms(rawData, this.transformSpec);
        
        if (this.hasBaseTone) {
            this.handleBaseToneStream(transformedData, sequence);
        } else {
            for (const stream of transformedData) {
                if ('stream' in stream && stream.stream) {
                    const isRepeated = isRepeatedStream(stream.stream);
                    const data = transformedData[stream.stream.data.name];
                    const slag = await compileSingleLayerAuidoGraph(stream.stream, data, this.audio_spec.config, this.tick, this.scales);
                    
                    if (!isRepeated && slag?.stream) {
                        sequence.addStream(slag?.stream as UnitStream);
                    } else if (slag?.stream) {
                        sequence.addStreams(slag?.stream as Array<UnitStream | OverlayStream>);
                    }
                    this.manageDataBuffer(data);
                } else if ('overlay' in stream && stream.overlay) {
                    this.handleOverlayStream(stream, sequence);
                }
            }
        }
    }

    handleBaseToneStream(transformedData: any, sequence: any) {
        // TODO: use rampBy to change the current base tone: 
        
        // export function rampBy(
            //   ramperType: RampFunctionName | undefined, // default -> linear
            //   param: AudioParam | ErieSynthFrequency, // any audio parameter that has ramping methods
            //   value: any, // the value to set
            //   time_at: number, // when to set the value
            //   speed?: number
            // ) 

        // Extract the new frequency or value for continuous sound
        const newFrequency = this.getNewFrequencyFromData(transformedData);

        // Use the rampBy function to change the frequency smoothly
        // rampBy(
        //     'linearRampToValueAtTime',  // Can be 'exponentialRampToValueAtTime', 'linearRampToValueAtTime', etc.
        //     this.baseTone.getFrequency(), // Get the current frequency of the base tone
        //     newFrequency,  // Set the new frequency value based on transformed data
        //     this.audio_spec.playback?.getTimeAt() || 0,  // Time at which to apply the change
        //     0.5 // Speed of transition (optional)
        // );

        // Update the base tone frequency
        // this.baseTone.setFrequency(newFrequency);


        // set remaining factors
    }

    getNewFrequencyFromData(data: any) {
        // Logic to extract the frequency or value based on the data stream
        // This depends on how your data is structured
        return data[0].frequency || 440; // Default to 440Hz if no frequency is provided
    }

    async handleOverlayStream(stream: any, sequence: any) {
        const overlays = new OverlayStream();
        this.setupSequence(overlays);
        
        for (const overlay of stream.overlay) {
            const data = applyTransforms(overlay.data, this.transformSpec);
            const config = { ...this.audio_spec.config, ...overlay.config };
            const overlayStrm =  await compileSingleLayerAuidoGraph(overlay, data, config, this.tick, this.scales);
            
            if (overlayStrm && overlayStrm.stream) {
                if (overlay.name) (overlayStrm.stream as UnitStream).setName(overlay.name);
                if (overlay.title) (overlayStrm.stream as UnitStream).setTitle(overlay.title);
                if (overlay.description) (overlayStrm.stream as UnitStream).setDescription(overlay.description);
                overlays.addStream(overlayStrm.stream as UnitStream);
              }
            this.manageDataBuffer(data);
        }
        sequence.addStream(overlays);
    }

    manageDataBuffer(data: any) {
        // Add timestamp to incoming data
        const timestampedData = new TimestampedData(data);
        
        this.dataBuffer.push(timestampedData);
        
        if (this.audio_spec.playback?.playback_unit === 'data points') {
            // Handle data points limit
            if (this.dataBuffer.length > this.MAX_DATA_POINTS) {
                this.dataBuffer.shift();
            }
        } else {
            // Handle time-based buffer - remove data older than MAX_TIME_MS
            const currentTime = Date.now();
            const cutoffTime = currentTime - this.MAX_TIME_MS;
            
            // Remove all elements older than cutoff time
            while (this.dataBuffer.length > 0 && this.dataBuffer[0].timestamp < cutoffTime) {
                this.dataBuffer.shift();
            }
        }
        this.outputSequence(timestampedData);
    }

    setupSequence(sequence: any) {
        sequence.setSampling(toHashedObject(this.samplings, 'name'));
        sequence.setSynths(toHashedObject(this.synths, 'name'));
        sequence.setWaves(toHashedObject(this.waves, 'name'));
    }

    generateBaseTone() {
        // TODO: make a base tone generator to set it
    

        // Create an AudioGraph
        // const audioGraph: AudioGraph = {
        //     // create audio graph object for base
        // };
        
        // Create options object, setting continued flag for looping
        const options: RecordObject = {
            is_continued: true
        };
    
        // Generate AudioGraphQueue for basetone??
    }

    outputSequence(data: any) {
        // Convert transformed data to PreGraphItem
        const preGraphItem: PreGraphItem = this.transformedDataToPreGraphItem(data);

        // add to existing base tone queue
        if (this.hasBaseTone) {

            // For continued base tone scenario
            this.audioGraphQueue.addStreamingData(
                preGraphItem, 
                { 
                    playImmediately: this.audio_spec.playback?.type === 'automatic',
                    continuedPlay: true 
                }
            );

        // new queue each time 
        } else {
            // TODO: start on blueprint of simplified audio graph queue for streaming case 
            // treat each time this function is called like an entire batch of static data
    
            // For non-continued scenario
            this.audioGraphQueue.addStreamingData(
                preGraphItem,
                { 
                    appendToExisting: false,
                    playImmediately: this.audio_spec.playback?.type === 'automatic'
                }
            );
        }
    }

    // Helper function to convert transformed data to queue item
    transformedDataToPreGraphItem(data: any): PreGraphItem {
        // Basic conversion logic
        return {
            instrument_type: 'sine',
            sound: {
                pitch: data.frequency,
                duration: 0.1,
                loudness: data.volume
            },
            duration: 0.1
        };
    }

}

export default TransformStreamManager;
