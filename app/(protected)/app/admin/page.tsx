import Link from "next/link";
import {
  createRequiredAdminClient,
  isAdminUser,
} from "@/lib/admin/admin-access";
import { reportCategoryLabel } from "@/lib/messages/moderation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type MessageReportRow = {
  category: string;
  contact_request_id: string;
  created_at: string;
  id: string;
  reported_user_id: string | null;
  reporter_user_id: string;
  status: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminPage() {
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
  const { data: reports, error } = await admin
    .from("message_reports")
    .select(
      "id, contact_request_id, reporter_user_id, reported_user_id, category, status, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <header className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f6f73]">
          Admin
        </p>
        <h1 className="mt-4 text-3xl font-bold text-[#172023]">
          Message reports
        </h1>
        <p className="mt-4 text-base leading-7 text-[#394548]">
          Review private message reports, hide problematic profiles, and block
          accounts from sending additional messages.
        </p>
      </header>

      {error ? (
        <p
          className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          role="alert"
        >
          Unable to load reports.
        </p>
      ) : null}

      {!error && (reports ?? []).length === 0 ? (
        <section className="mt-8 rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-5">
          <h2 className="text-xl font-bold text-[#172023]">No reports yet</h2>
          <p className="mt-3 text-sm leading-6 text-[#394548]">
            Message reports submitted by users will appear here.
          </p>
        </section>
      ) : null}

      <section className="mt-8 grid gap-4">
        {((reports ?? []) as MessageReportRow[]).map((report) => (
          <Link
            className="rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-5 shadow-sm hover:border-[#2f6f73]"
            href={`/app/admin/reports/${report.id}`}
            key={report.id}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#172023]">
                  {reportCategoryLabel(report.category)}
                </h2>
                <p className="mt-1 text-sm text-[#596466]">
                  Status: {report.status}
                </p>
              </div>
              <p className="text-sm text-[#596466]">
                {formatDate(report.created_at)}
              </p>
            </div>
            <p className="mt-4 text-sm leading-6 text-[#394548]">
              Contact request: {report.contact_request_id}
            </p>
            <p className="mt-2 text-sm leading-6 text-[#394548]">
              Reporter: {report.reporter_user_id}
            </p>
            <p className="mt-2 text-sm leading-6 text-[#394548]">
              Reported account: {report.reported_user_id ?? "Unavailable"}
            </p>
          </Link>
        ))}
      </section>
    </div>
  );
}
