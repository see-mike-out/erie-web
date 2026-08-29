import { test, expect } from 'vitest';
import { normalizeSpecification } from '../src/normalize';
import type { StreamingSpec } from '../src';
import type { NormalizedSingleStreamItem } from '../src';

test('normalize single sonification stream', async () => {
  const singleStreamSpec = {
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
      base_tone: true
    },
    encoding: {
      time: { field: 'a', type: 'quantitative' },
      pitch: { field: 'b', type: 'quantitative' }
    }
  };

  const { normalized, datasets } = await normalizeSpecification(singleStreamSpec);

  const streamItem = normalized[0] as NormalizedSingleStreamItem;
  const stream = streamItem.stream;
  if ('stream' in stream.data && stream.data.stream === true) {
    // streaming data case: 'test' is a key inside the streaming data containing actual data
    const streamingDatasetKey = Object.keys(stream.data).find(k => k !== 'stream');
    const streamingDataset = (streamingDatasetKey && streamingDatasetKey in stream.data) ? stream.data[streamingDatasetKey] : undefined;

    expect(streamingDataset).toBeDefined();
    expect(streamingDataset.values.length).toBe(2);
  }
  else {
    // inline data without name or streaming
    expect(stream.data.values.length).toBe(2);
  }
});
