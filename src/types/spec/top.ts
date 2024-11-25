import { OverlayStreamSpec } from "./overlay";
import { SequenceStreamSpec } from "./sequence";
import { SingleStreamSpec } from "./single-stream";

export type TopLevelSpec = SingleStreamSpec | OverlayStreamSpec | SequenceStreamSpec;