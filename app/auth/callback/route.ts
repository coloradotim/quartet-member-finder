import { NextResponse, type NextRequest } from "next/server";
import { firstSignInDestination } from "@/lib/onboarding/account-onboarding";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/app";
  const safeNext = next.startsWith("/") ? next : "/app";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = supabase
      ? await supabase.auth.exchangeCodeForSession(code)
      : { error: new Error("Supabase Auth is not configured.") };

    if (!error && supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const destination = user
        ? await firstSignInDestination(supabase, user, safeNext)
        : safeNext;

      return NextResponse.redirect(new URL(destination, requestUrl.origin));
    }
  }

  return NextResponse.redirect(
    new URL(
      "/sign-in?error=Unable%20to%20complete%20sign-in.",
      requestUrl.origin,
    ),
  );
}
