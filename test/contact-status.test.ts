import { describe, expect, it } from "vitest";
import { contactStatusMessage } from "@/lib/contact/contact-status";

describe("contact status messages", () => {
  it("describes the contact relay outcomes", () => {
    expect(contactStatusMessage("sent")).toMatchObject({ tone: "success" });
    expect(contactStatusMessage("stored")).toMatchObject({ tone: "notice" });
    expect(contactStatusMessage("error")).toMatchObject({ tone: "error" });
    expect(contactStatusMessage(undefined)).toBeNull();
  });

  it("uses OTP wording for authentication", () => {
    expect(contactStatusMessage("auth")?.text).toContain("one-time code");
    expect(contactStatusMessage("auth")?.text).not.toContain("magic link");
  });
});
