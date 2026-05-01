import type { User } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export function adminEmailAllowlist() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminUser(user: User | null) {
  const email = user?.email?.trim().toLowerCase();

  return Boolean(email && adminEmailAllowlist().includes(email));
}

export function createRequiredAdminClient() {
  const admin = createSupabaseAdminClient();

  if (!admin) {
    throw new Error("Admin Supabase client is not configured.");
  }

  return admin;
}
