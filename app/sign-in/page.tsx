import Link from "next/link";
import { signInWithEmail, verifyEmailOtp } from "@/app/auth/actions";

type SignInPageProps = {
  searchParams: Promise<{
    error?: string;
    email?: string;
    message?: string;
    next?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const next = params.next?.startsWith("/") ? params.next : "/app";
  const email = params.email ?? "";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
      <Link className="text-sm font-semibold text-[#2f6f73]" href="/">
        Quartet Member Finder
      </Link>
      <h1 className="mt-6 text-3xl font-bold text-[#172023]">Sign in</h1>
      <p className="mt-3 text-base leading-7 text-[#394548]">
        Enter your email address and Supabase will send a one-time code.
      </p>

      {params.error ? (
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {params.error}
        </p>
      ) : null}

      {params.message ? (
        <p className="mt-6 rounded-lg border border-[#b7d7ce] bg-[#eef8f4] p-4 text-sm text-[#174b4f]">
          {params.message}
        </p>
      ) : null}

      <form action={signInWithEmail} className="mt-8 space-y-4">
        <input name="next" type="hidden" value={next} />
        <label className="block">
          <span className="text-sm font-semibold text-[#172023]">Email</span>
          <input
            autoComplete="email"
            className="mt-2 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023] shadow-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
            defaultValue={email}
            name="email"
            placeholder="singer@example.com"
            required
            type="email"
          />
        </label>
        <button
          className="w-full rounded-md bg-[#174b4f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#10393c]"
          type="submit"
        >
          Send one-time code
        </button>
      </form>

      {email ? (
        <form
          action={verifyEmailOtp}
          className="mt-6 space-y-4 rounded-lg border border-[#d7cec0] bg-[#fffaf2] p-4"
        >
          <input name="email" type="hidden" value={email} />
          <input name="next" type="hidden" value={next} />
          <label className="block">
            <span className="text-sm font-semibold text-[#172023]">
              One-time code
            </span>
            <input
              autoComplete="one-time-code"
              className="mt-2 w-full rounded-md border border-[#d7cec0] bg-white px-3 py-2 text-base text-[#172023] shadow-sm outline-none focus:border-[#2f6f73] focus:ring-2 focus:ring-[#2f6f73]/20"
              inputMode="numeric"
              name="token"
              placeholder="123456"
              required
            />
          </label>
          <button
            className="w-full rounded-md bg-[#174b4f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#10393c]"
            type="submit"
          >
            Verify code
          </button>
        </form>
      ) : null}
    </main>
  );
}
