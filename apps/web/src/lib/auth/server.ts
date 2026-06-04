import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

type CookieToSet = { name: string; value: string; options: CookieOptions };

function authEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  return { url, anon };
}

export async function createAuthServerClient() {
  const env = authEnv();
  if (!env) return null;

  const cookieStore = await cookies();
  return createServerClient(env.url, env.anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          /* Server Component */
        }
      },
    },
  });
}

/** For route handlers: collect session cookies on a redirect response. */
export function createAuthServerClientForRequest(request: NextRequest) {
  const env = authEnv();
  if (!env) return { supabase: null, pendingCookies: [] as CookieToSet[] };

  const pendingCookies: CookieToSet[] = [];
  const supabase = createServerClient(env.url, env.anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        pendingCookies.push(...cookiesToSet);
      },
    },
  });

  return { supabase, pendingCookies };
}

export function applyPendingCookies(
  response: NextResponse,
  pendingCookies: CookieToSet[],
): NextResponse {
  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });
  return response;
}

export async function getAuthUser() {
  const supabase = await createAuthServerClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
