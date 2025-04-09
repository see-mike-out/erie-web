import { OrderSpec } from "./ordering";
import { OverlayStreamSpec } from "./overlay";
import { SequenceStreamSpec } from "./sequence";
import { SingleStreamSpec } from "./single-stream";
import { StreamingSpec } from "./streaming-spec";

export type TopLevelSpec = (SingleStreamSpec | OverlayStreamSpec | SequenceStreamSpec | StreamingSpec) & { ordering?: OrderSpec };