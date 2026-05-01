import { redirect } from "next/navigation";
import {
  discoverySignInPath,
  type DiscoverySearchParams,
} from "@/lib/auth/discovery-sign-in-path";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireAuthenticatedDiscovery(
  pathname: string,
  params: DiscoverySearchParams,
) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect(discoverySignInPath(pathname, params));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(discoverySignInPath(pathname, params));
  }

  return supabase;
}
