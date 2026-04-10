import { describe, expect, it } from "vitest";
import {
  normalizeCoordinates,
  normalizeHighlightEntries,
  normalizeRenderInputs,
} from "../../src/utils/normalization";

describe("normalizeCoordinates", () => {
  it("defaults coordinates: true to border mode when borderSize is present", () => {
    expect(normalizeCoordinates(true, 24)).toMatchObject({
      enabled: true,
      position: "border",
      color: "#333",
    });
  });

  it("defaults coordinates: true to inside mode when borderSize is zero", () => {
    expect(normalizeCoordinates(true, 0)).toMatchObject({
      enabled: true,
      position: "inside",
      color: undefined,
    });
  });

  it("uses the same defaulting rules for object-form coordinates", () => {
    expect(normalizeCoordinates({ enabled: true }, 24)).toMatchObject({
      enabled: true,
      position: "border",
      color: "#333",
    });
    expect(normalizeCoordinates({ enabled: true }, 0)).toMatchObject({
      enabled: true,
      position: "inside",
      color: undefined,
    });
  });
});

describe("normalizeRenderInputs", () => {
  it("normalizes string and object fill highlights into the same canonical shape", () => {
    expect(normalizeHighlightEntries(["e4"])).toEqual([
      { square: "e4", style: "fill", color: undefined, opacity: undefined, lineWidth: undefined },
    ]);
    expect(normalizeHighlightEntries([{ square: "e4" }])).toEqual([
      { square: "e4", style: "fill", color: undefined, opacity: undefined, lineWidth: undefined },
    ]);
    expect(normalizeHighlightEntries([{ square: "e4", style: "fill" }])).toEqual([
      { square: "e4", style: "fill", color: undefined, opacity: undefined, lineWidth: undefined },
    ]);
  });

  it("normalizes circle highlights with circle defaults", () => {
    expect(normalizeHighlightEntries([{ square: "e4", style: "circle" }])).toEqual([
      { square: "e4", style: "circle", color: "#ffcc00", opacity: 0.9, lineWidth: undefined, radius: 0.42 },
    ]);
  });

  it("preserves a custom circle radius", () => {
    expect(
      normalizeHighlightEntries([{ square: "e4", style: "circle", radius: 0.45 }]),
    ).toEqual([
      { square: "e4", style: "circle", color: "#ffcc00", opacity: 0.9, lineWidth: undefined, radius: 0.45 },
    ]);
  });

  it("preserves duplicate highlight entries and alias inputs", () => {
    expect(
      normalizeRenderInputs({
        size: 400,
        style: "cburnett",
        highlights: ["e4", { square: "e4", style: "circle" }],
      }).highlights,
    ).toEqual([
      { square: "e4", style: "fill", color: undefined, opacity: undefined, lineWidth: undefined },
      { square: "e4", style: "circle", color: "#ffcc00", opacity: 0.9, lineWidth: undefined, radius: 0.42 },
    ]);
    expect(
      normalizeRenderInputs({
        size: 400,
        style: "cburnett",
        highlightSquares: ["e4"],
      }).highlights,
    ).toEqual([
      { square: "e4", style: "fill", color: undefined, opacity: undefined, lineWidth: undefined },
    ]);
  });

  it("rejects simultaneous highlights and highlightSquares", () => {
    expect(() =>
      normalizeRenderInputs({
        size: 400,
        style: "cburnett",
        highlights: ["e4"],
        highlightSquares: ["d5"],
      }),
    ).toThrow();
  });

  it("preserves explicit inside mode", () => {
    expect(
      normalizeRenderInputs({
        size: 400,
        style: "cburnett",
        coordinates: "inside",
      }).coordinates,
    ).toMatchObject({
      enabled: true,
      position: "inside",
      color: undefined,
    });
  });

  it("preserves explicit border mode", () => {
    expect(
      normalizeRenderInputs({
        size: 400,
        style: "cburnett",
        borderSize: 24,
        coordinates: "border",
      }).coordinates,
    ).toMatchObject({
      enabled: true,
      position: "border",
      color: "#333",
    });
  });
});
