import { OverlayStreamSpec } from "./overlay";
import { SequenceStreamSpec } from "./sequence";
import { SingleStreamSpec } from "./single-stream";
import { StreamingSpec } from "./streaming-data";

export type TopLevelSpec = SingleStreamSpec | OverlayStreamSpec | SequenceStreamSpec | StreamingSpec;