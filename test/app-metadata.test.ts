import { describe, expect, it } from "vitest";
import { PRODUCT_NAME, PRODUCT_PROMISE } from "@/lib/app-metadata";

describe("app metadata", () => {
  it("names the product", () => {
    expect(PRODUCT_NAME).toBe("Quartet Member Finder");
  });

  it("keeps privacy in the core promise", () => {
    expect(PRODUCT_PROMISE).toContain("private");
    expect(PRODUCT_PROMISE).toContain("Find quartet openings");
    expect(PRODUCT_PROMISE).toContain("available singers");
  });
});
