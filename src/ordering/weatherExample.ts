import { OrderSpec } from "../types/spec/order";

export const weatherExample: OrderSpec = {
  ordering: [
    // Markup item introducing the sonification
    {
      type: "markup",
      description: "Introduction to weather sonification",
      specifier: {
        role: "stream.name",
        channel: "time", // Relates to the encoding channel 'time'
      },
      option: {
        markup: "Welcome to the weather sonification.",
      },
    },
    // Text item describing temperature feature
    {
      type: "text",
      text: "Temperature is represented by pitch.",
    },
    // Sound item for temperature with sound indicators
    {
      type: "sound",
      description: "Temperature sonification",
      specifier: {
        role: "stream.sound",
        stream: {
          index: 0,
          overlay: {
            index: 0,
          },
        },
        channel: "pitch", // Relates to the encoding channel 'pitch'
      },
      option: {
        indicateStart: {
          type: "chime",
          pitch: 880,
          loudness: 0.8,
          duration: 0.3,
        },
        indicateEnd: {
          type: "chime",
          pitch: 440,
          loudness: 0.8,
          duration: 0.3,
        },
      },
    },
    // Markup item describing humidity feature
    {
      type: "markup",
      description: "Humidity sonification description",
      specifier: {
        role: "stream.scale.description",
        channel: "pan", // Relates to the encoding channel 'pan'
      },
      option: {
        markup: "Humidity is represented by pan position.",
      },
    },
    // Sound item for humidity with sound indicators
    {
      type: "sound",
      description: "Humidity sonification",
      specifier: {
        role: "stream.sound",
        stream: {
          index: 0,
          overlay: {
            index: 1,
          },
        },
        channel: "pan", // Relates to the encoding channel 'pan'
      },
      option: {
        indicateStart: {
          type: "chime",
          pitch: 660,
          loudness: 0.8,
          duration: 0.3,
        },
        indicateEnd: {
          type: "chime",
          pitch: 220,
          loudness: 0.8,
          duration: 0.3,
        },
      },
    },
    // Text item concluding the sonification
    {
      type: "text",
      text: "Sonification complete.",
    },
  ],
};
