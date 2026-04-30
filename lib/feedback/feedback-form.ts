export const FEEDBACK_MESSAGE_MAX_LENGTH = 3000;
export const FEEDBACK_CONTEXT_MAX_LENGTH = 500;
export const FEEDBACK_RATE_LIMIT_COUNT = 3;
export const FEEDBACK_RATE_LIMIT_WINDOW_MINUTES = 60;

export const feedbackTypes = ["feedback", "bug", "suggestion"] as const;

export type FeedbackType = (typeof feedbackTypes)[number];

export type FeedbackFormValues = {
  contextPath: string | null;
  feedbackType: FeedbackType;
  message: string;
};

function trimToNull(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed ? trimmed : null;
}

export function normalizeFeedbackContext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  return value.slice(0, FEEDBACK_CONTEXT_MAX_LENGTH);
}

export function parseFeedbackFormData(formData: FormData): FeedbackFormValues {
  const feedbackType = trimToNull(formData.get("feedbackType"));
  const message = trimToNull(formData.get("message"));
  const contextPath = normalizeFeedbackContext(
    trimToNull(formData.get("contextPath")),
  );

  if (
    feedbackType !== "feedback" &&
    feedbackType !== "bug" &&
    feedbackType !== "suggestion"
  ) {
    throw new Error("Choose a feedback type.");
  }

  if (!message) {
    throw new Error("Add a short message.");
  }

  if (message.length > FEEDBACK_MESSAGE_MAX_LENGTH) {
    throw new Error(
      `Keep feedback under ${FEEDBACK_MESSAGE_MAX_LENGTH} characters.`,
    );
  }

  return {
    contextPath,
    feedbackType,
    message,
  };
}

export function feedbackRateLimitWindowStart(now = new Date()) {
  return new Date(
    now.getTime() - FEEDBACK_RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
  ).toISOString();
}
