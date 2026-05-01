import Link from "next/link";
import { notFound } from "next/navigation";
import { sendMessageReply } from "@/app/(protected)/app/messages/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type MessageDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    reply?: string;
  }>;
};

type ContactRequestRow = {
  created_at: string;
  id: string;
  message_body: string;
  quartet_listing_id: string | null;
  recipient_user_id: string | null;
  sender_user_id: string;
  singer_profile_id: string | null;
  status: string;
};

type ContactReplyRow = {
  created_at: string;
  id: string;
  message_body: string;
  sender_user_id: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function replyStatusMessage(value: string | undefined) {
  if (value === "sent") {
    return "Reply sent. The other person has been notified by email.";
  }

  if (value === "stored") {
    return "Reply saved. Email notification is waiting on Resend or server email configuration.";
  }

  if (value === "error") {
    return "Unable to send that reply. Check the message and try again.";
  }

  return null;
}

function targetKind(request: ContactRequestRow) {
  return request.singer_profile_id ? "singer profile" : "quartet profile";
}

async function targetName(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  request: ContactRequestRow,
) {
  if (request.singer_profile_id) {
    const [{ data: owned }, { data: visible }] = await Promise.all([
      supabase
        .from("singer_profiles")
        .select("display_name")
        .eq("id", request.singer_profile_id)
        .maybeSingle(),
      supabase
        .from("singer_discovery_profiles")
        .select("display_name")
        .eq("id", request.singer_profile_id)
        .maybeSingle(),
    ]);

    return owned?.display_name ?? visible?.display_name ?? "Singer profile";
  }

  const quartetId = request.quartet_listing_id ?? "unknown";
  const [{ data: owned }, { data: visible }] = await Promise.all([
    supabase
      .from("quartet_listings")
      .select("name")
      .eq("id", quartetId)
      .maybeSingle(),
    supabase
      .from("quartet_discovery_listings")
      .select("name")
      .eq("id", quartetId)
      .maybeSingle(),
  ]);

  return owned?.name ?? visible?.name ?? "Quartet profile";
}

export default async function MessageDetailPage({
  params,
  searchParams,
}: MessageDetailPageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (!supabase || !user) {
    return null;
  }

  const { data: request } = await supabase
    .from("contact_requests")
    .select(
      "id, sender_user_id, recipient_user_id, singer_profile_id, quartet_listing_id, message_body, status, created_at",
    )
    .eq("id", id)
    .maybeSingle<ContactRequestRow>();

  if (
    !request ||
    (request.sender_user_id !== user.id &&
      request.recipient_user_id !== user.id)
  ) {
    notFound();
  }

  const [{ data: replies }, resolvedTargetName] = await Promise.all([
    supabase
      .from("contact_request_replies")
      .select("id, sender_user_id, message_body, created_at")
      .eq("contact_request_id", request.id)
      .order("created_at", { ascending: true }),
    targetName(supabase, request),
  ]);
  const replyStatus = replyStatusMessage(query.reply);
  const userIsOriginalSender = request.sender_user_id === user.id;

  return (
    <div className="max-w-3xl">
      <Link className="font-semibold text-[#2f6f73]" href="/app/messages">
        Back to Messages
      </Link>
      <header className="mt-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f6f73]">
          Message detail
        </p>
        <h1 className="mt-4 text-3xl font-bold text-[#172023]">
          {resolvedTargetName}
        </h1>
        <p className="mt-3 text-base leading-7 text-[#394548]">
          {userIsOriginalSender
            ? `You sent this first contact request to a ${targetKind(request)}.`
            : `This first contact request was sent to your ${targetKind(
                request,
              )}.`}
        </p>
      </header>

      {replyStatus ? (
        <p
          className={`mt-6 rounded-lg border p-4 text-sm ${
            query.reply === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-[#b7d7ce] bg-[#eef8f4] text-[#174b4f]"
          }`}
          role={query.reply === "error" ? "alert" : "status"}
        >
          {replyStatus}
        </p>
      ) : null}

      <article className="mt-8 rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <h2 className="text-xl font-bold text-[#172023]">Original message</h2>
          <p className="text-sm text-[#596466]">
            {formatDate(request.created_at)}
          </p>
        </div>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#394548]">
          {request.message_body}
        </p>
      </article>

      <section className="mt-8" aria-labelledby="replies-heading">
        <h2 className="text-2xl font-bold text-[#172023]" id="replies-heading">
          Replies
        </h2>
        {(replies ?? []).length === 0 ? (
          <p className="mt-3 rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-5 text-sm leading-6 text-[#394548]">
            No replies yet. Replies stay in the app, and notification emails
            link back here.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {((replies ?? []) as ContactReplyRow[]).map((reply) => (
              <article
                className="rounded-lg border border-[#d7cec0] bg-white p-5"
                key={reply.id}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <h3 className="font-bold text-[#172023]">
                    {reply.sender_user_id === user.id
                      ? "You"
                      : "The other participant"}
                  </h3>
                  <p className="text-sm text-[#596466]">
                    {formatDate(reply.created_at)}
                  </p>
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#394548]">
                  {reply.message_body}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <form
        action={sendMessageReply}
        className="mt-8 rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-5"
      >
        <input name="requestId" type="hidden" value={request.id} />
        <label className="block">
          <span className="text-sm font-semibold text-[#172023]">Reply</span>
          <textarea
            className="mt-2 min-h-32 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023] shadow-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
            maxLength={2000}
            name="message"
            placeholder="Write a friendly reply. Share direct contact details only if you choose to."
            required
          />
        </label>
        <p className="mt-3 text-sm leading-6 text-[#596466]">
          Private email addresses and phone numbers are not shown by default.
          The notification email points the other participant back to Messages.
        </p>
        <button
          className="mt-4 w-full rounded-md bg-[#174b4f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#10393c] sm:w-fit"
          type="submit"
        >
          Send reply
        </button>
      </form>
    </div>
  );
}
