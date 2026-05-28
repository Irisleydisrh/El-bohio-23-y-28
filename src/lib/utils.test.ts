import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn (className merger)", () => {
  it("combines two class strings", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    const isActive = true;
    const isDisabled = false;
    expect(cn("base", isActive && "active", isDisabled && "disabled")).toBe("base active");
  });

  it("handles empty strings", () => {
    expect(cn("foo", "", "bar")).toBe("foo bar");
  });

  it("handles undefined and null", () => {
    expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
  });

  it("merges conflicting tailwind classes (twMerge behavior)", () => {
    // twMerge should keep the last occurrence
    expect(cn("px-2 py-1", "py-2")).toBe("px-2 py-2");
  });

  it("handles arrays", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar");
  });

  it("handles nested arrays", () => {
    expect(cn(["foo", ["bar", "baz"]])).toBe("foo bar baz");
  });
});