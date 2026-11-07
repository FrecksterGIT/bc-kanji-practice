import { describe, expect, it } from "vite-plus/test";
import { getSwipeDirection } from "./useSwipe.ts";

describe("getSwipeDirection", () => {
  it("returns undefined when the movement is below the threshold", () => {
    expect(getSwipeDirection(200, 150, 100)).toBeUndefined();
    expect(getSwipeDirection(150, 200, 100)).toBeUndefined();
  });

  it("returns undefined when the movement is exactly the threshold", () => {
    expect(getSwipeDirection(200, 100, 100)).toBeUndefined();
    expect(getSwipeDirection(100, 200, 100)).toBeUndefined();
  });

  it("returns left when the movement is beyond the threshold towards smaller x", () => {
    expect(getSwipeDirection(300, 100, 100)).toBe("left");
  });

  it("returns right when the movement is beyond the threshold towards larger x", () => {
    expect(getSwipeDirection(100, 300, 100)).toBe("right");
  });

  it("returns undefined for no movement", () => {
    expect(getSwipeDirection(50, 50, 100)).toBeUndefined();
  });
});
