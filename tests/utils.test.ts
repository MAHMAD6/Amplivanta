import { describe, it, expect } from "vitest";
import { cn, slugify, truncate, formatNumber } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });
  it("dedupes conflicting tailwind classes (last wins)", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
  it("drops falsy values", () => {
    expect(cn("a", false && "b", undefined, "c")).toBe("a c");
  });
});

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });
  it("strips special characters", () => {
    expect(slugify("Amplivanta — Growth!")).toBe("amplivanta-growth");
  });
});

describe("truncate", () => {
  it("leaves short strings untouched", () => {
    expect(truncate("hi", 10)).toBe("hi");
  });
  it("truncates and appends ellipsis", () => {
    expect(truncate("abcdefgh", 3)).toBe("abc...");
  });
});

describe("formatNumber", () => {
  it("returns small numbers as-is", () => {
    expect(formatNumber(950)).toBe("950");
  });
  it("abbreviates thousands", () => {
    expect(formatNumber(2500)).toBe("2.5k");
  });
});
