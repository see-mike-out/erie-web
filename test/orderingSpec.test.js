import { describe, it, expect, beforeEach } from "vitest";
import { normalizeOrderSpec } from "../src/ordering/order";
import { overlayOrderingSpec } from "../src/ordering/confidenceEnvelopeExample";
import { normalizeSpecification } from "../src/compile/audio-graph-normalize";
import confidenceEnvelopeSpec from "./confidenceEnvelopeExample.json";

describe("normalizeOrderSpec", async () => {
  let orderSpec;
  let normalizedOrderSpec;
  let normalizedStreamItems;
  let normalizationResult;

  beforeEach(async () => {
    console.log("Setting up test data...");
    orderSpec = overlayOrderingSpec;
    console.log("Original OrderSpec:", JSON.stringify(orderSpec, null, 2));
    console.log(
      "Confidence Envelope Spec:",
      JSON.stringify(confidenceEnvelopeSpec, null, 2)
    );

    console.log("Normalizing specification...");
    normalizationResult = await normalizeSpecification(confidenceEnvelopeSpec);
    normalizedStreamItems = normalizationResult.normalized;
    console.log(
      "Normalized Stream Items:",
      JSON.stringify(normalizedStreamItems, null, 2)
    );

    console.log("Normalizing OrderSpec...");
    normalizedOrderSpec = normalizeOrderSpec(orderSpec, normalizedStreamItems);
  });

  it("should verify normalization output", () => {
    console.log("Verifying normalization output...");
    expect(normalizedStreamItems).toBeDefined();
    console.log("Normalization output verified.");
  });

  it("should correctly normalize the specifiers in the ordering items", () => {
    console.log("Checking normalization of specifiers...");
    normalizedOrderSpec.ordering.forEach((item, index) => {
      console.log(`Checking item ${index}:`, JSON.stringify(item, null, 2));
      const originalItem = orderSpec.ordering[index];
      console.log(
        `Original item ${index}:`,
        JSON.stringify(originalItem, null, 2)
      );

      expect(item.type).toBe(originalItem.type);
      expect(item.options).toEqual(originalItem.option || originalItem.options);

      if (item.specifier && originalItem.specifier?.stream !== undefined) {
        const streamIndex = originalItem.specifier.stream.index;
        const overlayIndex = originalItem.specifier.stream.overlay?.index;

        if (overlayIndex !== undefined) {
          const expectedStreamId = normalizedStreamItems[0].id;
          const expectedOverlayId =
            normalizedStreamItems[0].overlay[overlayIndex].id;
          console.log(`Expected streamId for item ${index}:`, expectedStreamId);
          console.log(
            `Expected overlayId for item ${index}:`,
            expectedOverlayId
          );
          expect(item.specifier.streamId).toBe(expectedStreamId);
          expect(item.specifier.overlayId).toBe(expectedOverlayId);
        } else {
          const expectedStreamId = normalizedStreamItems[0].id;
          console.log(`Expected streamId for item ${index}:`, expectedStreamId);
          expect(item.specifier.streamId).toBe(expectedStreamId);
          expect(item.specifier.overlayId).toBeUndefined();
        }
      } else {
        expect(item.specifier?.streamId).toBeUndefined();
        expect(item.specifier?.overlayId).toBeUndefined();
      }

      expect(item.specifier?.channel).toBe(originalItem.specifier?.channel);
      console.log(`Item ${index} verification complete.`);
    });
    console.log("Specifier normalization check complete.");
  });

  it("should handle items without specifiers correctly", () => {
    console.log("Testing handling of items without specifiers...");
    const modifiedSpec = { ...overlayOrderingSpec };
    modifiedSpec.ordering.push({
      type: "markup",
      description: "No specifier item",
    });
    console.log("Modified spec:", JSON.stringify(modifiedSpec, null, 2));

    const updatedNormalizedOrderSpec = normalizeOrderSpec(
      modifiedSpec,
      normalizedStreamItems
    );
    console.log(
      "Updated normalized OrderSpec:",
      JSON.stringify(updatedNormalizedOrderSpec, null, 2)
    );

    expect(updatedNormalizedOrderSpec.ordering.length).toBe(
      modifiedSpec.ordering.length
    );
    expect(
      updatedNormalizedOrderSpec.ordering[modifiedSpec.ordering.length - 1]
        .specifier
    ).toBeUndefined();
    console.log("Handling of items without specifiers verified.");
  });

  it("should return a normalized OrderSpec with the correct id and streams", () => {
    console.log("Checking normalized OrderSpec structure...");
    expect(normalizedOrderSpec).toBeDefined();
    expect(normalizedOrderSpec.id).toBeDefined();
    expect(normalizedOrderSpec.ordering).toBeDefined();
    expect(normalizedOrderSpec.ordering.length).toBe(orderSpec.ordering.length);
    console.log("Normalized OrderSpec structure verified.");
    console.log(
      "Normalized OrderSpec (for sanity check):",
      JSON.stringify(normalizedOrderSpec, null, 2)
    );
  });
});
