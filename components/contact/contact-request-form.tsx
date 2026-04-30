import { sendContactRequest } from "@/app/contact/actions";
import type { ContactTargetKind } from "@/lib/contact/contact-relay";

type ContactRequestFormProps = {
  returnTo: string;
  targetId: string;
  targetKind: ContactTargetKind;
  targetName: string;
};

export function ContactRequestForm({
  returnTo,
  targetId,
  targetKind,
  targetName,
}: ContactRequestFormProps) {
  return (
    <form
      action={sendContactRequest}
      className="mt-5 rounded-md border border-[#d7cec0] bg-white p-4"
    >
      <input name="returnTo" type="hidden" value={returnTo} />
      <input name="targetId" type="hidden" value={targetId} />
      <input name="targetKind" type="hidden" value={targetKind} />
      <label className="block">
        <span className="text-sm font-semibold text-[#172023]">
          Contact {targetName}
        </span>
        <textarea
          className="mt-2 min-h-24 w-full rounded-md border border-[#d7cec0] px-3 py-2 text-sm"
          maxLength={2000}
          name="message"
          placeholder="Share a short, friendly note about the quartet opportunity."
          required
        />
      </label>
      <button
        className="mt-3 rounded-md bg-[#174b4f] px-4 py-2.5 text-sm font-semibold text-white"
        type="submit"
      >
        Send contact request
      </button>
    </form>
  );
}
