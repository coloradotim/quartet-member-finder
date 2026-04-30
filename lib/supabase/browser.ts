"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicConfig } from "@/lib/supabase/env";

export function createSupabaseBrowserClient() {
  const config = getSupabasePublicConfig();

  if (!config) {
    throw new Error(
      "Supabase public environment variables are not configured.",
    );
  }

  return createBrowserClient(config.url, config.anonKey);
}
