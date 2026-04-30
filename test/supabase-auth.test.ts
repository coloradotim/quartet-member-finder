import { afterEach, describe, expect, it, vi } from "vitest";

describe("Supabase public env helpers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns null when public Supabase values are missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");

    const { getSupabaseAdminConfig, getSupabasePublicConfig } =
      await import("@/lib/supabase/env");

    expect(getSupabasePublicConfig()).toBeNull();
    expect(getSupabaseAdminConfig()).toBeNull();
  });

  it("uses only public Supabase values for client configuration", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role-key");

    const { getSupabaseAdminConfig, getSupabasePublicConfig } =
      await import("@/lib/supabase/env");

    expect(getSupabasePublicConfig()).toEqual({
      anonKey: "anon-key",
      url: "https://example.supabase.co",
    });
    expect(getSupabaseAdminConfig()).toEqual({
      anonKey: "anon-key",
      serviceRoleKey: "service-role-key",
      url: "https://example.supabase.co",
    });
  });
});
