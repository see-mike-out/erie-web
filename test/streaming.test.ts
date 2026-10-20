import { test, expect } from 'vitest';
import { genRid, StreamingSpec, type NormalizedSingleStreamItem, normalizeSpecification } from '../src';

test('normalize single sonification stream', async () => {
  const singleStreamSpec: StreamingSpec = {
    title: "Single Stream Test",
    description: "A single sonification test",
    data: {
      stream: true,
      test: {
        values: [
          { a: 1, b: 2 },
          { a: 3, b: 4 }
        ]
      }
    },
    tone: {
      hasBaseTone: true
    },
    encoding: {
      time: { field: 'a', type: 'quantitative' },
      pitch: { field: 'b', type: 'quantitative' }
    }
  };

  const { normalized, datasets } = await normalizeSpecification(genRid(), singleStreamSpec);

  const streamItem = normalized[0] as NormalizedSingleStreamItem;
  const stream = streamItem.stream;
  if ('stream' in stream.data && stream.data.stream === true) {
    // streaming data case: 'test' is a key inside the streaming data containing actual data
    const streamingDatasetKey = Object.keys(stream.data).find(k => k !== 'stream');

    expect(streamingDatasetKey).toBeDefined();
    expect(streamingDatasetKey && streamingDatasetKey in stream.data).toBe(true);

    // @ts-ignore
    const streamingDataset = (streamingDatasetKey && streamingDatasetKey in stream.data) ? stream.data[streamingDatasetKey] : undefined;

    expect(streamingDataset).toBeDefined();
    expect(streamingDataset.values.length).toBe(2);
  }
  else {
    // inline data without name or streaming
    expect(stream.data).toHaveProperty("values");
    if ('values' in stream.data && stream.data.values !== undefined) {
      // @ts-ignore
      expect(stream.data.values.length).toBe(2);
    }
  }
});
