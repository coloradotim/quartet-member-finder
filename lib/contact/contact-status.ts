export type ContactStatus = "auth" | "blocked" | "error" | "sent" | "stored";

export function contactStatusMessage(status: string | string[] | undefined) {
  const value = Array.isArray(status) ? status[0] : status;

  if (value === "sent") {
    return {
      tone: "success" as const,
      text: "Contact request sent. The recipient can decide whether to respond or share direct contact information.",
    };
  }

  if (value === "stored") {
    return {
      tone: "notice" as const,
      text: "Contact request saved. Email notification is waiting on Resend or server email configuration.",
    };
  }

  if (value === "auth") {
    return {
      tone: "notice" as const,
      text: "Sign in with an email one-time code before sending a contact request.",
    };
  }

  if (value === "blocked") {
    return {
      tone: "error" as const,
      text: "This account is not currently allowed to send messages.",
    };
  }

  if (value === "error") {
    return {
      tone: "error" as const,
      text: "Unable to send that contact request. Check the message and try again.",
    };
  }

  return null;
}
