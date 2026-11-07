import { describe, expect, it } from "vite-plus/test";
import { toSubmittedReading } from "./kanaInput.ts";

describe("toSubmittedReading", () => {
  it("converts a trailing n to ん so readings ending in ん can be answered with n", () => {
    expect(toSubmittedReading("san")).toBe("さん");
    expect(toSubmittedReading("hon")).toBe("ほん");
  });

  it("still accepts the explicit nn form", () => {
    expect(toSubmittedReading("sann")).toBe("さん");
  });

  it("converts ordinary readings unchanged", () => {
    expect(toSubmittedReading("ichi")).toBe("いち");
    expect(toSubmittedReading("nihon")).toBe("にほん");
  });

  it("converts a trailing n after existing kana", () => {
    expect(toSubmittedReading("こn")).toBe("こん");
  });
});
