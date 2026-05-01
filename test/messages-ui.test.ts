import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(path, "utf8");
}

describe("messages UI", () => {
  it("provides inbox, sent, empty states, and message detail replies", () => {
    const messagesPage = source("app/(protected)/app/messages/page.tsx");
    const detailPage = source("app/(protected)/app/messages/[id]/page.tsx");
    const replyAction = source("app/(protected)/app/messages/actions.ts");

    expect(messagesPage).toContain("Messages");
    expect(messagesPage).toContain("Inbox");
    expect(messagesPage).toContain("Sent");
    expect(messagesPage).toContain(
      "Messages you receive through the app will appear here.",
    );
    expect(messagesPage).toContain(
      "Messages you send to singers or quartet profiles will appear here.",
    );
    expect(detailPage).toContain("Original message");
    expect(detailPage).toContain("Send reply");
    expect(detailPage).toContain(
      "Private email addresses and phone numbers are not shown by default.",
    );
    expect(replyAction).toContain("contact_request_replies");
    expect(replyAction).toContain("sendContactReplyNotification");
  });
});
