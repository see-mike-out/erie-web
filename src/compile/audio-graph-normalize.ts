import {
  isOverlayStream,
  isSequenceStream,
  isSingleStream
} from "./audio-graph-spec-type-check";
import { normalizeSingleSpec } from "./audio-graph-normalize-single";
import { normalizeScaleConsistency } from "./audio-graph-normalize-scale";

import {
  OVERLAY,
  SEQUENCE,
  NormalizedStream,
  TopLevelSpec,
  ExtendedSingleSpec,
  NormalizedStreamItem,
  NormalizedSingleStream,
  ParsedScaleDefinition,
  ConfigInterface,
  ParsedDatasetObject,
  TickObject,
  TransformList,
  IntroStream,
  NormalizedOverlayItem,
  NormalizedIntroStreamItem,
  NormalizedSingleStreamItem,
  DataSpec,
  DatasetSpecItem,
  InSeqOverlayStreamSpec,
  UnitStreamSpec,
  WaveObject,
  SampledToneObject,
  SynthObject,
  DataSpec3,
} from "../types";
import {
  deepcopy,
  genRid,
  unique,
  toHashedObject
} from "../util";

export async function normalizeSpecification(_spec: TopLevelSpec): Promise<NormalizedStream> {
  let spec = deepcopy(_spec);
  let streams: NormalizedStreamItem[] = [],
    datasets: ParsedDatasetObject[] = 'datasets' in spec ? deepcopy(spec.datasets || []) : [],
    synths: SynthObject[] = deepcopy(spec.synth || []),
    samplings: SampledToneObject[] = deepcopy(spec.sampling || []),
    tickDefs: TickObject[] = deepcopy(spec.tick || []),
    waves: WaveObject[] = deepcopy(spec.wave || []),
    scales: ParsedScaleDefinition[] = [],
    config: ConfigInterface | undefined = undefined;
  let used_encodings: string[] = [];
  let _partial_datasets = {}, _partial_ticks = {};
  if (isSingleStream(spec)) {
    if ('data' in spec && spec.data) {
      // moving to datasets
      if (!('name' in spec.data)) {
        let new_data_name = "data__" + (datasets.length + 1)
        datasets.push({
          name: new_data_name,
          ...deepcopy(spec.data)
        });
        spec.data = { name: new_data_name } as DataSpec3;
      }
    }
    let { normalized, scaleDefinitions } = normalizeSingleSpec(spec as ExtendedSingleSpec, null);
    if (normalized !== null && scaleDefinitions !== null) {
      streams.push({ stream: normalized });
      scales.push(...scaleDefinitions);
      used_encodings.push(...Object.keys(normalized.encoding));
    }
  } else {
    let new_data_name: string | null = null;
    if ('data' in spec && spec.data
      && (!('name' in spec.data) || !spec.data.name)
      && (!('type' in spec.data) || spec.data.type !== "unset")
      && 'values' in spec.data && spec.data.values) {
      new_data_name = "data__" + (datasets.length + 1);
      datasets.push({
        name: new_data_name,
        ...deepcopy(spec.data)
      });
    }
    if (isOverlayStream(spec) && 'overlay' in spec) {
      let overlay: NormalizedSingleStream[] = [];
      // sort out the dataset in use
      let toplevel_data: DataSpec | null = null, toplevel_data_name: string | null = null;
      // if the spec has a single dataset with values
      if ('data' in spec && spec.data
        && (!('name' in spec.data) || !spec.data.name)
        && (!('type' in spec.data) || spec.data.type !== "unset")) {
        // assign dataset name 
        toplevel_data_name = `data__${((datasets.length ?? 0) + 1)}`;
        // then pass it as a dataset;
        toplevel_data = { name: toplevel_data_name } as DataSpec3;
        datasets.push({ name: toplevel_data_name, ...deepcopy(spec.data) } as ParsedDatasetObject);
      }
      // or if the spec's data has a name
      else if ('data' in spec && spec.data
        && ('name' in spec.data && spec.data.name)) {
        toplevel_data = deepcopy(spec.data);
        if (!('dataset' in spec) || !spec.dataset) {
          console.warn("Dataset name can't be used with a specified dataset");
        }
      }

      for (const _o of spec.overlay) {
        // eligibility check
        if (!isSingleStream(_o)) console.error("An overlay of multi-stream sequences is not supported!");

        // deep-copy to not interrupt the original spec.
        let o = deepcopy(_o) as ExtendedSingleSpec;

        // when the current unit stream of the overlay doesn't dataset
        // then pass the top-level dataset by its name
        if (toplevel_data && !o.data) {
          // if top-level data is on its own (not set as reference name)
          if (toplevel_data_name) {
            o.data = { name: toplevel_data_name } as DataSpec;
          }
          // if top-level data is specified as name
          else if (!o.data) {
            o.data = toplevel_data as DataSpec;
          }
        }
        // when the current unit stream has a data object specified
        else if (o.data) {
          // if the specified data doesn't have the name
          // then assign it to the top-level datasets and refer it by name
          if (!('name' in o.data) || !o.data.name) {
            let dname = `data__${(datasets.length + 1)}`;
            datasets.push({ name: dname, ...o.data } as DatasetSpecItem);
            o.data = { name: dname };
          }
        }

        // if data is not specified, there's toplevel data available, use it
        if (!o.data && new_data_name) o.data = { name: new_data_name };

        // transform
        o.common_transform = deepcopy(spec.transform || []) as TransformList;
        o.transform = deepcopy(_o.transform || []) as TransformList;

        // *** Tick ***
        // when its time encoding has a tick element
        // making it refer to the corresponding top-level tick object
        if (o.encoding?.time?.tick !== undefined) {
          // when it is not specified as name
          // or it is not referring to a top-level tick object
          if (!o.encoding?.time.tick.name
            || !tickDefs.filter((d: TickObject) => d.name === o.encoding?.time?.tick?.name)) {
            // define a new tick object in the top level
            let new_tick_name = o.encoding?.time.tick.name || ("tick_" + (tickDefs.length + 1));
            tickDefs.push({
              ...o.encoding?.time.tick,
              name: new_tick_name,
            });
            // then replace it by the name
            o.encoding.time.tick = { name: new_tick_name };
          }
        }

        // normalize a unit overlay stream
        let n = normalizeSingleSpec(o, OVERLAY);

        // once done w/o errors
        if (n.normalized !== null && n.scaleDefinitions !== null) {
          // update used encodings
          used_encodings.push(...Object.keys(n.normalized.encoding));
          // push normalized specs to normalized overaly streams
          overlay.push(n.normalized);
          // push scale definitions to the total set
          scales.push(...n.scaleDefinitions);
        }
      }

      // copy the upper level configurations
      let config: ConfigInterface = {}
      if ('config' in spec.overlay) {
        Object.assign(config, spec.overlay.config);
      }
      Object.assign(config, spec.config);

      // normalize scales
      normalizeScaleConsistency(config, unique(used_encodings));
      // to not cause confusion
      delete config.sequenceScaleConsistency;
      delete config.forceSequenceScaleConsistency;

      // finally pass to the 
      streams.push({ overlay, name: spec.name, title: spec.title, description: spec.description, config });
    } else if (isSequenceStream(spec as UnitStreamSpec | InSeqOverlayStreamSpec) && 'sequence' in spec) {
      // [todo] specify type
      let output: NormalizedStreamItem[] = [];
      let introSeq: IntroStream = {};
      config = {} as ConfigInterface;
      Object.assign(config, spec.config);

      // make intro stream
      if (spec.title) introSeq.title = spec.title;
      if (spec.description) introSeq.description = spec.description;
      if (Object.keys(introSeq).length > 0) {
        output.push({ intro: introSeq })
      }

      for (const _o of spec.sequence) {
        // eligibility check
        if (isSequenceStream(_o)) console.error("A sequence of sequence is not supported!")

        // deep-copy to not interrupt the original spec
        let o = deepcopy(_o) as ExtendedSingleSpec;
        // if the current sub-stream is a single stream
        if (isSingleStream(o as TopLevelSpec)) {
          // *** Tick ***
          // if the time channel has tick -> move it to the top level tick def.
          if (o.encoding?.time?.tick) {
            if (!o.encoding?.time?.tick.name
              || !tickDefs.filter((d: TickObject) => d.name === o.encoding?.time?.tick?.name)) {
              let new_tick_name = o.encoding?.time.tick.name || ("tick_" + (tickDefs.length + 1));
              tickDefs.push({
                ...o.encoding?.time.tick,
                name: new_tick_name,
              });
              o.encoding.time.tick = { name: new_tick_name };
            }
          }
          // if it has no data set, then assign the top level data
          if (!o.data && new_data_name) o.data = { name: new_data_name };
          // or if it has raw data defined
          else if ('values' in o.data && o.data?.values) {
            let new_data_name_2 = "data__" + (datasets.length + 1);
            datasets.push({
              name: new_data_name_2,
              values: deepcopy(o.data.values)
            } as ParsedDatasetObject);
            o.data = { name: new_data_name_2 };
          }
          o.common_transform = deepcopy(spec.transform || []) as TransformList;
          o.transform = deepcopy(_o.transform || []) as TransformList;

          // normalize
          let n = normalizeSingleSpec(o, SEQUENCE);

          // if okay, update to the full spec
          if (n.normalized !== null && n.scaleDefinitions !== null) {
            scales.push(...n.scaleDefinitions);
            output.push({ stream: n.normalized });
            used_encodings.push(...Object.keys(n.normalized.encoding));
          }
        }
        // if the current sub-stream is an overlay spec
        else if (isOverlayStream(o as TopLevelSpec)) {
          let overlay_id = 'overlay-' + genRid();

          // run a recursion
          let n = await normalizeSpecification(o as TopLevelSpec);

          // as it should generate only a single overlay stream
          let over = n.normalized[0] as NormalizedOverlayItem;

          // if well-parsed
          if ('overlay' in over) {
            // reassign id
            over.id = overlay_id;
            output.push(over);
            // update scales
            n.scaleDefinitions.forEach((d) => {
              d.parentId = overlay_id
            });
            scales.push(...n.scaleDefinitions);

            over.overlay?.forEach((ov) => {
              used_encodings.push(...Object.keys(ov.encoding));
            });

            // update the datasets and ticks just in case
            Object.assign(_partial_datasets, n.datasets);
            Object.assign(_partial_ticks, n.tick);
          }
        }
      }
      normalizeScaleConsistency(config, unique(used_encodings));
      delete config.overlayScaleConsistency;
      delete config.forceOverlayScaleConsistency;
      streams.push(...output.map((d) => {
        if ('intro' in d) {
          return { intro: d.intro as IntroStream } as NormalizedIntroStreamItem
        } else if ('overlay' in d) {
          return {
            overlay: d.overlay,
            id: d.id,
            name: d.name,
            title: d.title,
            description: d.description,
            config: d.config
          } as NormalizedOverlayItem
        } else if ('stream' in d) {
          return { stream: d.stream } as NormalizedSingleStreamItem;
        }
      }).filter(d => d !== undefined));
    }
  }
  let dataset_hash = toHashedObject(datasets, 'name', true);
  Object.assign(dataset_hash, _partial_datasets);

  let tick_hash = toHashedObject(tickDefs, 'name', true);
  Object.assign(tick_hash, _partial_ticks);

  if (!config) {
    config = {};
    Object.assign(config, spec.config);
    normalizeScaleConsistency(config, unique(used_encodings));
    delete config.overlayScaleConsistency;
    delete config.forceOverlayScaleConsistency;
  }

  return {
    normalized: streams,
    datasets: dataset_hash,
    tick: tick_hash,
    scaleDefinitions: scales,
    sequenceConfig: config,
    synths,
    samplings,
    waves
  };
}


