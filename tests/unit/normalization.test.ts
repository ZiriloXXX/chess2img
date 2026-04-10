import { describe, expect, it } from "vitest";
import { normalizeCoordinates, normalizeRenderInputs } from "../../src/utils/normalization";

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
