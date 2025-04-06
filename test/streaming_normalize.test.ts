// sum.test.js
import { expect, test } from 'vitest'
import { StreamingSpec } from '../src';
import { normalizeSpecification } from '../src/normalize';

test('normalize streaming spec', async () => {
  let test_spec: StreamingSpec = {
    data: {
      stream: true,
      test: {
        values: [
          { a: 3, b: 7 },
          { a: 5, b: 10 }
        ]
      }
    },
    tone: {
      continued: false
    },
    encoding: {
      time: {
        field: 'a',
        type: 'quantitative',
        scale: {
          range: [0, 3],
          domain: [0, 5]
        }
      },
      pitch: {
        field: 'b',
        type: 'quantitative',
        scale: {
          domain: [0, 10]
        }
      }
    }
  }
  let { normalized, datasets, tick, scaleDefinitions, sequenceConfig, synths, samplings, waves } = await normalizeSpecification(test_spec);
  // console.log(JSON.stringify(normalized, null, 2))
  // console.log(JSON.stringify(scaleDefinitions, null, 2))
})