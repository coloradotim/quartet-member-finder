"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAppUrl } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function redirectWithMessage(
  path: string,
  key: "error" | "message",
  value: string,
): never {
  redirect(`${path}?${key}=${encodeURIComponent(value)}`);
}

export async function signInWithEmail(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const next = String(formData.get("next") ?? "/app");

  if (!email) {
    redirectWithMessage("/sign-in", "error", "Enter an email address.");
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirectWithMessage(
      "/sign-in",
      "error",
      "Supabase Auth is not configured for this environment.",
    );
  }

  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin") ?? getAppUrl();
  const emailRedirectTo = `${origin}/auth/callback?next=${encodeURIComponent(
    next.startsWith("/") ? next : "/app",
  )}`;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo,
    },
  });

  if (error) {
    redirectWithMessage("/sign-in", "error", error.message);
  }

  redirectWithMessage(
    "/sign-in",
    "message",
    "Check your email for a sign-in link.",
  );
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/");
}
