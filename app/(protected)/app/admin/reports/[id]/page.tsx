import Link from "next/link";
import { notFound } from "next/navigation";
import {
  blockReportedAccount,
  hideReportedQuartetProfile,
  hideReportedSingerProfile,
  permanentlyBlockReportedAccount,
  updateReportStatus,
} from "@/app/(protected)/app/admin/actions";
import {
  createRequiredAdminClient,
  isAdminUser,
} from "@/lib/admin/admin-access";
import { reportCategoryLabel } from "@/lib/messages/moderation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AdminReportPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    admin?: string;
  }>;
};

type MessageReportRow = {
  admin_notes: string | null;
  category: string;
  contact_request_id: string;
  created_at: string;
  id: string;
  note: string | null;
  reported_user_id: string | null;
  reporter_user_id: string;
  status: string;
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function adminStatusMessage(value: string | undefined) {
  if (value === "updated") return "Report status updated.";
  if (value === "blocked") return "Reported account blocked from messaging.";
  if (value === "permanently-blocked") {
    return "Reported account permanently blocked and public profiles hidden.";
  }
  if (value === "hidden") return "Reported profile hidden from discovery.";
  return null;
}

export default async function AdminReportDetailPage({
  params,
  searchParams,
}: AdminReportPageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (!isAdminUser(user)) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-[#172023]">Not authorized</h1>
        <p className="mt-4 text-base leading-7 text-[#394548]">
          This admin area is limited to authorized project administrators.
        </p>
        <Link
          className="mt-6 inline-flex font-semibold text-[#2f6f73]"
          href="/app"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  const admin = createRequiredAdminClient();
  const [{ data: report }, { data: contactRequest }] = await Promise.all([
    admin
      .from("message_reports")
      .select(
        "id, contact_request_id, reporter_user_id, reported_user_id, category, note, status, admin_notes, created_at",
      )
      .eq("id", id)
      .maybeSingle<MessageReportRow>(),
    admin
      .from("message_reports")
      .select("contact_request_id")
      .eq("id", id)
      .maybeSingle()
      .then(async ({ data }) => {
        if (!data?.contact_request_id) return { data: null };

        return admin
          .from("contact_requests")
          .select(
            "id, sender_user_id, recipient_user_id, singer_profile_id, quartet_listing_id, message_body, status, created_at",
          )
          .eq("id", data.contact_request_id)
          .maybeSingle<ContactRequestRow>();
      }),
  ]);

  if (!report || !contactRequest) {
    notFound();
  }

  const [
    { data: moderationStatus },
    { count: priorReportCount },
    { data: singerProfile },
    { data: quartetListing },
  ] = await Promise.all([
    report.reported_user_id
      ? admin
          .from("user_moderation_status")
          .select(
            "account_status, messaging_blocked_at, messaging_block_reason",
          )
          .eq("user_id", report.reported_user_id)
          .maybeSingle()
      : { data: null },
    report.reported_user_id
      ? admin
          .from("message_reports")
          .select("id", { count: "exact", head: true })
          .eq("reported_user_id", report.reported_user_id)
      : { count: 0 },
    contactRequest.singer_profile_id
      ? admin
          .from("singer_profiles")
          .select("id, display_name, is_visible")
          .eq("id", contactRequest.singer_profile_id)
          .maybeSingle()
      : { data: null },
    contactRequest.quartet_listing_id
      ? admin
          .from("quartet_listings")
          .select("id, name, is_visible")
          .eq("id", contactRequest.quartet_listing_id)
          .maybeSingle()
      : { data: null },
  ]);
  const statusMessage = adminStatusMessage(query.admin);

  return (
    <div className="max-w-4xl">
      <Link className="font-semibold text-[#2f6f73]" href="/app/admin">
        Back to admin reports
      </Link>
      <header className="mt-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f6f73]">
          Admin report detail
        </p>
        <h1 className="mt-4 text-3xl font-bold text-[#172023]">
          {reportCategoryLabel(report.category)}
        </h1>
        <p className="mt-3 text-base leading-7 text-[#394548]">
          Report ID: {report.id}
        </p>
      </header>

      {statusMessage ? (
        <p
          className="mt-6 rounded-lg border border-[#b7d7ce] bg-[#eef8f4] p-4 text-sm text-[#174b4f]"
          role="status"
        >
          {statusMessage}
        </p>
      ) : null}

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-5">
          <h2 className="text-xl font-bold text-[#172023]">Report</h2>
          <p className="mt-3 text-sm leading-6 text-[#394548]">
            Status: {report.status}
          </p>
          <p className="mt-2 text-sm leading-6 text-[#394548]">
            Submitted: {formatDate(report.created_at)}
          </p>
          <p className="mt-2 text-sm leading-6 text-[#394548]">
            Reporter: {report.reporter_user_id}
          </p>
          <p className="mt-2 text-sm leading-6 text-[#394548]">
            Reported account: {report.reported_user_id ?? "Unavailable"}
          </p>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#394548]">
            {report.note || "No reporter note provided."}
          </p>
        </article>

        <article className="rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-5">
          <h2 className="text-xl font-bold text-[#172023]">Reported account</h2>
          <p className="mt-3 text-sm leading-6 text-[#394548]">
            Moderation status: {moderationStatus?.account_status ?? "active"}
          </p>
          <p className="mt-2 text-sm leading-6 text-[#394548]">
            Message block:{" "}
            {moderationStatus?.messaging_blocked_at
              ? formatDate(moderationStatus.messaging_blocked_at)
              : "not blocked"}
          </p>
          <p className="mt-2 text-sm leading-6 text-[#394548]">
            Prior reports for this account: {priorReportCount ?? 0}
          </p>
        </article>
      </section>

      <section className="mt-8 rounded-lg border border-[#d7cec0] bg-white p-5">
        <h2 className="text-xl font-bold text-[#172023]">Message context</h2>
        <p className="mt-3 text-sm leading-6 text-[#394548]">
          Contact request: {contactRequest.id}
        </p>
        <p className="mt-2 text-sm leading-6 text-[#394548]">
          Sender: {contactRequest.sender_user_id}
        </p>
        <p className="mt-2 text-sm leading-6 text-[#394548]">
          Recipient: {contactRequest.recipient_user_id ?? "Unavailable"}
        </p>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#394548]">
          {contactRequest.message_body}
        </p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {singerProfile ? (
          <form
            action={hideReportedSingerProfile}
            className="rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-5"
          >
            <input name="reportId" type="hidden" value={report.id} />
            <input
              name="singerProfileId"
              type="hidden"
              value={singerProfile.id}
            />
            <h2 className="text-xl font-bold text-[#172023]">Singer profile</h2>
            <p className="mt-3 text-sm leading-6 text-[#394548]">
              {singerProfile.display_name}; visible:{" "}
              {singerProfile.is_visible ? "yes" : "no"}
            </p>
            <button
              className="mt-4 rounded-md border border-[#8a3b12] px-4 py-2.5 text-sm font-semibold text-[#8a3b12] hover:bg-white"
              type="submit"
            >
              Hide singer profile
            </button>
          </form>
        ) : null}

        {quartetListing ? (
          <form
            action={hideReportedQuartetProfile}
            className="rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-5"
          >
            <input name="reportId" type="hidden" value={report.id} />
            <input
              name="quartetListingId"
              type="hidden"
              value={quartetListing.id}
            />
            <h2 className="text-xl font-bold text-[#172023]">
              Quartet profile
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#394548]">
              {quartetListing.name}; visible:{" "}
              {quartetListing.is_visible ? "yes" : "no"}
            </p>
            <button
              className="mt-4 rounded-md border border-[#8a3b12] px-4 py-2.5 text-sm font-semibold text-[#8a3b12] hover:bg-white"
              type="submit"
            >
              Hide quartet profile
            </button>
          </form>
        ) : null}
      </section>

      {report.reported_user_id ? (
        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <form
            action={blockReportedAccount}
            className="rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-5"
          >
            <input name="reportId" type="hidden" value={report.id} />
            <input
              name="reportedUserId"
              type="hidden"
              value={report.reported_user_id}
            />
            <h2 className="text-xl font-bold text-[#172023]">
              Block messaging
            </h2>
            <label className="mt-4 block">
              <span className="text-sm font-semibold text-[#172023]">
                Internal reason
              </span>
              <textarea
                className="mt-2 min-h-20 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023]"
                name="reason"
              />
            </label>
            <button
              className="mt-4 rounded-md bg-[#174b4f] px-4 py-2.5 text-sm font-semibold text-white"
              type="submit"
            >
              Block from messaging
            </button>
          </form>

          <form
            action={permanentlyBlockReportedAccount}
            className="rounded-lg border border-red-200 bg-red-50 p-5"
          >
            <input name="reportId" type="hidden" value={report.id} />
            <input
              name="reportedUserId"
              type="hidden"
              value={report.reported_user_id}
            />
            <h2 className="text-xl font-bold text-[#172023]">
              Permanent block
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#394548]">
              Use for serious or repeated abuse. This hides the account&apos;s
              public profiles and blocks future messaging. Account deletion
              remains a separate manual Supabase Auth step.
            </p>
            <button
              className="mt-4 rounded-md border border-red-700 px-4 py-2.5 text-sm font-semibold text-red-800"
              type="submit"
            >
              Permanently block account
            </button>
          </form>
        </section>
      ) : null}

      <form
        action={updateReportStatus}
        className="mt-8 rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-5"
      >
        <input name="reportId" type="hidden" value={report.id} />
        <h2 className="text-xl font-bold text-[#172023]">Resolve report</h2>
        <label className="mt-4 block">
          <span className="text-sm font-semibold text-[#172023]">Status</span>
          <select
            className="mt-2 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023]"
            defaultValue={report.status}
            name="status"
          >
            <option value="reviewed">Reviewed</option>
            <option value="action_taken">Action taken</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </label>
        <label className="mt-4 block">
          <span className="text-sm font-semibold text-[#172023]">
            Admin notes
          </span>
          <textarea
            className="mt-2 min-h-24 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023]"
            defaultValue={report.admin_notes ?? ""}
            name="adminNotes"
          />
        </label>
        <button
          className="mt-4 rounded-md bg-[#174b4f] px-4 py-2.5 text-sm font-semibold text-white"
          type="submit"
        >
          Save report status
        </button>
      </form>
    </div>
  );
}
