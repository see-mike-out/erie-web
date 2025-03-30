import { OrderSpec } from "../src/types/spec/order";

export const overlayOrderingSpec: OrderSpec = {
  ordering: [
    // Corresponds to: 1. text "To stop playing the sonification, press the X key."
    {
      type: "markup",
      description: "Stop Sonification Shortcut",
      specifier: {
        role: "stop-play-keyboard-shortcut",
      },
    },

    // Corresponds to: 2. text linear regression model."
    {
      type: "markup",
      description: "Stream Name",
      specifier: {
        role: "stream.name",
        stream: { index: 0 },
      },
    },

    //markup taking from sequence stream, with specifer
    // Corresponds to: text "This stream has X overlaid sounds."
    {
      type: "markup",
      description: "Overlay Count Announcement",
      specifier: {
        //maybe not needed
        role: "stream.overlay.length",
        stream: { index: 0 },
      },
      option: {
        markup: `The <stream.name> stream has <overlay.length> overlaid sounds.`,
      },
    },

    // Corresponds to: 3. text "Overlay 1. Prediction."
    {
      type: "markup",
      description: "Overlay 1 Name",
      specifier: {
        role: "stream.name",
        stream: { index: 0, overlay: { index: 0 } },
      },
    },

    // Corresponds to: 4. text "Overlay 2. Lower bound."
    {
      type: "markup",
      description: "Overlay 2 Name",
      specifier: {
        role: "stream.name",
        stream: { index: 0, overlay: { index: 1 } },
      },
    },

    // Corresponds to: 5. text "Overlay 3. Upper bound."
    {
      type: "markup",
      description: "Overlay 3 Name",
      specifier: {
        role: "stream.name",
        stream: { index: 0, overlay: { index: 2 } },
      },
    },

    // Corresponds to 6: text "This stream has the following sound mappings."
    {
      type: "markup",
      description: "Stream Sound Mappings",
      specifier: {
        role: "stream.scale.overview",
        stream: { index: 0 },
      },
      option: {
        markup: `This stream has the following sound mappings.`,
      },
    },

    // Corresponds to: 7. text "The Petal Length is mapped to time. The duration of the stream is 2 seconds."
    {
      type: "markup",
      description: "Base Time Scale Description",
      specifier: {
        role: "stream.scale.description",
        stream: { index: 0 },
        channel: "time",
      },
      option: {
        //not text should pull from object
        markup: `The <field> is mapped to <channel>. The duration of the stream is <range.max> seconds.`,
      },
    },

    // Corresponds to: 8 and 9. text "The Predicted Sepal Length is mapped to pan. The domain values from −0.01037 to 8.158 are mapped to"
    {
      type: "markup",
      description: "Overlay 1 Pan Mapping",
      specifier: {
        role: "stream.scale.description",
        stream: { index: 0, overlay: { index: 0 } },
        channel: "pan",
      },
      option: {
        markup: [
          `The <title> is mapped to <channel>. The domain values from <domain.min> to <domain.max> are mapped to <sound v0="domain.min" v1="domain.max" duration="0.5">.`,
        ],
      },
    },

    // Corresponds to: 10 and 11. text "The Predicted Sepal Length is mapped to pitch. The domain values from −0.01037 to 8.158 are mapped to" // REFORMAT
    {
      type: "markup",
      description: "Overlay 1 Pitch Mapping",
      specifier: {
        role: "stream.scale.description",
        stream: { index: 0, overlay: { index: 0 } },
        channel: "pitch",
      },
      option: {
        markup: [
          `The <title> is mapped to <channel>. The domain values from <domain.min> to <domain.max> are mapped to <sound v0="domain.min" v1="domain.max" duration="0.5">.`,
        ],
      },
    },

    {
      type: "sound",
      description: "all sound",
      specifier: {
        role: "stream.sound",
        stream: { index: 0 },
      },
      option: {
        indicateStart: true,
      },
    },

    // Corresponds to: 14. text "Finished." //have default as well
    {
      type: "text",
      description: "Finished",
      text: "Finished.",
    },
  ],
};