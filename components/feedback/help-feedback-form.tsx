import { submitHelpFeedback } from "@/app/help/actions";
import { FEEDBACK_MESSAGE_MAX_LENGTH } from "@/lib/feedback/feedback-form";

type HelpFeedbackFormProps = {
  status?: string;
};

function feedbackStatusMessage(status?: string) {
  if (status === "sent") {
    return "Thanks for the note. Your feedback was emailed to the project team.";
  }

  if (status === "limited") {
    return "You have sent several notes recently. Please try again later.";
  }

  if (status === "error") {
    return "Feedback could not be submitted. Please try again.";
  }

  return null;
}

export function HelpFeedbackForm({ status }: HelpFeedbackFormProps) {
  const statusMessage = feedbackStatusMessage(status);
  const isSuccess = status === "sent";

  return (
    <section className="mt-10 border-t border-[#d7cec0] pt-8" id="feedback">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f6f73]">
          Feedback
        </p>
        <h2 className="mt-3 text-2xl font-bold text-[#172023]">
          Send a note to the project team
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[#394548]">
          Share feedback, bug reports, or suggestions. Your note is private and
          is tied to your signed-in account for follow-up and abuse prevention.
        </p>
      </div>

      {statusMessage ? (
        <p
          className={`mt-5 rounded-md border p-4 text-sm ${
            isSuccess
              ? "border-[#b7d7ce] bg-[#eef8f4] text-[#174b4f]"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
          role={isSuccess ? "status" : "alert"}
        >
          {statusMessage}
        </p>
      ) : null}

      <form action={submitHelpFeedback} className="mt-5 grid gap-4">
        <input name="contextPath" type="hidden" value="/help" />

        <label className="block">
          <span className="text-sm font-semibold text-[#172023]">Type</span>
          <select
            className="mt-2 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023] shadow-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
            defaultValue="feedback"
            name="feedbackType"
            required
          >
            <option value="feedback">General feedback</option>
            <option value="bug">Bug report</option>
            <option value="suggestion">Suggestion</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-[#172023]">Message</span>
          <textarea
            className="mt-2 min-h-36 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023] shadow-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
            maxLength={FEEDBACK_MESSAGE_MAX_LENGTH}
            name="message"
            placeholder="What should we know?"
            required
          />
        </label>

        <button
          className="w-full rounded-md bg-[#174b4f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#10393c] sm:w-fit"
          type="submit"
        >
          Send feedback
        </button>
      </form>
    </section>
  );
}
