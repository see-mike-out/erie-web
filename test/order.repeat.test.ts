import { test } from "vitest";
import { OrderSpec, TopLevelSpec } from "../src";
import { normalizeOrderSpec, normalizeSpecification } from "../src/normalize";

let order_spec: OrderSpec = [
  {
    specifier: {
      role: "description",
      stream: { index: 0 }
    }
  },
  {
    specifier: {
      role: 'scale.overview',
      stream: { index: 0 }
    }
  },
  {
    specifier: {
      role: 'scale.description',
      stream: { index: 0 },
      channel: 'repeat'
    }
  },
  {
    specifier: {
      role: 'scale.description',
      stream: { index: 0 },
      channel: 'time'
    }
  },
  {
    specifier: {
      role: 'scale.description',
      stream: { index: 0 },
      channel: 'pitch'
    }
  },
  {
    specifier: {
      role: 'scale.description',
      stream: { index: 0 },
      channel: 'pan'
    }
  },
  {
    specifier: {
      role: 'repeat.title',
      stream: { index: 0 },
      is_repeated: true
    }
  },
  {
    specifier: {
      role: 'sound',
      stream: { index: 0 },
      is_repeated: true
    }
  }
]

const spec: TopLevelSpec = {
  "description": "The kernel density estimation of body mass by species and island",
  "data": {
    "url": "data/penguins.json"
  },
  "transform": [
    {
      "density": "Body Mass (g)",
      "groupby": [
        "Species",
        "Island"
      ],
      "extent": [
        2500,
        6500
      ]
    }
  ],
  "tone": {
    "continued": true
  },
  "encoding": {
    "time": {
      "field": "value",
      "type": "quantitative",
      "scale": {
        "length": 3,
        "title": "Body Mass value"
      }
    },
    "pan": {
      "field": "value",
      "type": "quantitative",
      "scale": {
        "polarity": "positive",
        "title": "Body Mass value"
      }
    },
    "pitch": {
      "field": "density",
      "type": "quantitative",
      "scale": {
        "polarity": "positive",
        "range": [
          0,
          700
        ],
        "title": "Kernel density"
      },
      "format": ".4"
    },
    "repeat": {
      "field": [
        "Species",
        "Island"
      ],
      "type": "nominal",
      "speech": true,
      "scale": {
        "description": "skip"
      }
    }
  },
  "config": {
    "speechRate": 1.75
  },
  ordering: order_spec
}


test('normalize streaming spec with rep', async () => {
  let { normalized, datasets, tick, scaleDefinitions, sequenceConfig, synths, samplings, waves } = await normalizeSpecification(spec);
  let ordering_normalized = normalizeOrderSpec(order_spec, normalized);
  //console.log("Normalized", ordering_normalized)
  // console.log(JSON.stringify(normalized, null, 2))
  // console.log(JSON.stringify(scaleDefinitions, null, 2))
})