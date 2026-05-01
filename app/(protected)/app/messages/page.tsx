import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type MessagesPageProps = {
  searchParams: Promise<{
    view?: string;
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
  updated_at: string;
};

type ContactReplyRow = {
  contact_request_id: string;
  created_at: string;
};

const previewLength = 180;

function previewMessage(message: string) {
  const normalized = message.replace(/\s+/g, " ").trim();

  return normalized.length > previewLength
    ? `${normalized.slice(0, previewLength - 1)}...`
    : normalized;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function targetKind(request: ContactRequestRow) {
  return request.singer_profile_id ? "singer profile" : "quartet profile";
}

async function targetNames(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  requests: ContactRequestRow[],
) {
  const names = new Map<string, string>();
  const singerIds = requests
    .map((request) => request.singer_profile_id)
    .filter((id): id is string => Boolean(id));
  const quartetIds = requests
    .map((request) => request.quartet_listing_id)
    .filter((id): id is string => Boolean(id));

  if (singerIds.length > 0) {
    const [{ data: owned }, { data: visible }] = await Promise.all([
      supabase
        .from("singer_profiles")
        .select("id, display_name")
        .in("id", singerIds),
      supabase
        .from("singer_discovery_profiles")
        .select("id, display_name")
        .in("id", singerIds),
    ]);

    for (const singer of [...(visible ?? []), ...(owned ?? [])]) {
      names.set(singer.id, singer.display_name);
    }
  }

  if (quartetIds.length > 0) {
    const [{ data: owned }, { data: visible }] = await Promise.all([
      supabase.from("quartet_listings").select("id, name").in("id", quartetIds),
      supabase
        .from("quartet_discovery_listings")
        .select("id, name")
        .in("id", quartetIds),
    ]);

    for (const quartet of [...(visible ?? []), ...(owned ?? [])]) {
      names.set(quartet.id, quartet.name);
    }
  }

  return names;
}

function targetName(request: ContactRequestRow, names: Map<string, string>) {
  const id = request.singer_profile_id ?? request.quartet_listing_id;

  if (!id) {
    return targetKind(request);
  }

  return names.get(id) ?? targetKind(request);
}

export default async function MessagesPage({
  searchParams,
}: MessagesPageProps) {
  const params = await searchParams;
  const activeView = params.view === "sent" ? "sent" : "inbox";
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (!supabase || !user) {
    return null;
  }

  const query = supabase
    .from("contact_requests")
    .select(
      "id, sender_user_id, recipient_user_id, singer_profile_id, quartet_listing_id, message_body, status, created_at, updated_at",
    )
    .order("updated_at", { ascending: false });

  const { data, error } =
    activeView === "sent"
      ? await query.eq("sender_user_id", user.id)
      : await query.eq("recipient_user_id", user.id);
  const requests = (data ?? []) as ContactRequestRow[];
  const names = await targetNames(supabase, requests);
  const requestIds = requests.map((request) => request.id);
  const { data: replyRows } =
    requestIds.length > 0
      ? await supabase
          .from("contact_request_replies")
          .select("contact_request_id, created_at")
          .in("contact_request_id", requestIds)
      : { data: [] };
  const replyCounts = new Map<string, number>();

  for (const reply of (replyRows ?? []) as ContactReplyRow[]) {
    replyCounts.set(
      reply.contact_request_id,
      (replyCounts.get(reply.contact_request_id) ?? 0) + 1,
    );
  }

  return (
    <div>
      <header className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f6f73]">
          Messages
        </p>
        <h1 className="mt-4 text-3xl font-bold text-[#172023]">Messages</h1>
        <p className="mt-4 text-base leading-7 text-[#394548]">
          Read app-mediated contact requests and replies without exposing
          private email addresses or phone numbers by default.
        </p>
      </header>

      <nav aria-label="Message views" className="mt-8 flex flex-wrap gap-3">
        {[
          { href: "/app/messages", label: "Inbox", view: "inbox" },
          { href: "/app/messages?view=sent", label: "Sent", view: "sent" },
        ].map((link) => (
          <Link
            aria-current={activeView === link.view ? "page" : undefined}
            className={`rounded-md border px-4 py-2 text-sm font-semibold ${
              activeView === link.view
                ? "border-[#174b4f] bg-[#174b4f] text-white"
                : "border-[#d7cec0] bg-[#fffaf2] text-[#394548] hover:border-[#2f6f73]"
            }`}
            href={link.href}
            key={link.view}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {error ? (
        <p
          className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          role="alert"
        >
          Unable to load messages right now.
        </p>
      ) : null}

      {!error && requests.length === 0 ? (
        <section className="mt-8 rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-5">
          <h2 className="text-xl font-bold text-[#172023]">
            {activeView === "sent" ? "No sent messages yet" : "Inbox is empty"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#394548]">
            {activeView === "sent"
              ? "Messages you send to singers or quartet profiles will appear here."
              : "Messages you receive through the app will appear here."}
          </p>
          {activeView === "inbox" ? (
            <p className="mt-3 text-sm leading-6 text-[#394548]">
              You can still send messages before publishing a profile. Receiving
              messages depends on having a discoverable singer or quartet
              profile.
            </p>
          ) : null}
        </section>
      ) : null}

      <section className="mt-8 grid gap-4">
        {requests.map((request) => (
          <Link
            className="rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-5 shadow-sm hover:border-[#2f6f73]"
            href={`/app/messages/${request.id}`}
            key={request.id}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#172023]">
                  {targetName(request, names)}
                </h2>
                <p className="mt-1 text-sm text-[#596466]">
                  {activeView === "sent"
                    ? `Sent to a ${targetKind(request)}`
                    : `Received for your ${targetKind(request)}`}
                </p>
              </div>
              <p className="text-sm text-[#596466]">
                {formatDate(request.updated_at ?? request.created_at)}
              </p>
            </div>
            <p className="mt-4 text-sm leading-6 text-[#394548]">
              {previewMessage(request.message_body)}
            </p>
            <p className="mt-4 text-sm font-semibold text-[#2f6f73]">
              {replyCounts.get(request.id)
                ? `${replyCounts.get(request.id)} repl${
                    replyCounts.get(request.id) === 1 ? "y" : "ies"
                  }`
                : activeView === "sent"
                  ? "No replies yet"
                  : "Awaiting your reply"}
            </p>
          </Link>
        ))}
      </section>
    </div>
  );
}
