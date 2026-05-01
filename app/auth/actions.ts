"use server";

import { redirect } from "next/navigation";
import {
  captureProductEvent,
  pseudonymousAnalyticsUserId,
} from "@/lib/analytics/product-analytics";
import { firstSignInDestination } from "@/lib/onboarding/account-onboarding";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function redirectWithMessage(
  route: string,
  key: "error" | "message",
  value: string,
): never {
  const separator = route.includes("?") ? "&" : "?";

  redirect(`${route}${separator}${key}=${encodeURIComponent(value)}`);
}

export async function signInWithEmail(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const next = String(formData.get("next") ?? "/app");
  const safeNext = next.startsWith("/") ? next : "/app";

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

  const { error } = await supabase.auth.signInWithOtp({
    email,
  });

  if (error) {
    redirectWithMessage("/sign-in", "error", error.message);
  }

  await captureProductEvent("sign_in_started", {
    route: "/sign-in",
    route_area: "auth",
    status: "sent",
  });

  redirect(
    `/sign-in?email=${encodeURIComponent(email)}&next=${encodeURIComponent(
      safeNext,
    )}&message=${encodeURIComponent("Check your email for the one-time code.")}`,
  );
}

export async function verifyEmailOtp(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const token = String(formData.get("token") ?? "")
    .trim()
    .replace(/\s+/g, "");
  const next = String(formData.get("next") ?? "/app");
  const safeNext = next.startsWith("/") ? next : "/app";

  if (!email || !token) {
    redirectWithMessage(
      `/sign-in?email=${encodeURIComponent(email)}&next=${encodeURIComponent(
        safeNext,
      )}`,
      "error",
      "Enter the one-time code from your email.",
    );
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirectWithMessage(
      "/sign-in",
      "error",
      "Supabase Auth is not configured for this environment.",
    );
  }

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) {
    redirectWithMessage(
      `/sign-in?email=${encodeURIComponent(email)}&next=${encodeURIComponent(
        safeNext,
      )}`,
      "error",
      error.message,
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(safeNext);
  }

  await captureProductEvent(
    "user_logged_in",
    {
      route: "/sign-in",
      route_area: "auth",
    },
    { distinctId: pseudonymousAnalyticsUserId(user.id) },
  );
  await captureProductEvent(
    "sign_in_completed",
    {
      route: "/sign-in",
      route_area: "auth",
      status: "verified",
    },
    { distinctId: pseudonymousAnalyticsUserId(user.id) },
  );

  redirect(await firstSignInDestination(supabase, user, safeNext));
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/");
}
