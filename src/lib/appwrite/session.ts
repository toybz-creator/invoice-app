import "server-only";

import { cookies } from "next/headers";
import type { Models } from "node-appwrite";

import { createSessionAccount } from "@/lib/appwrite/admin";
import { withAppwriteRetry } from "@/lib/appwrite/retry";
import {
  getSessionCookieName,
  getSessionCookieOptions,
} from "@/lib/appwrite/session-cookie";
import { logDevelopmentError } from "@/lib/logger";

export function getCurrentSessionCookieName() {
  return getSessionCookieName(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
}

export async function setSessionCookie(secret: string, expires?: string) {
  const cookieStore = await cookies();

  cookieStore.set(
    getCurrentSessionCookieName(),
    secret,
    getSessionCookieOptions(expires),
  );
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.delete(getCurrentSessionCookieName());
}

export async function getSessionSecret() {
  const cookieStore = await cookies();

  return cookieStore.get(getCurrentSessionCookieName())?.value ?? null;
}

export async function getAuthenticatedUser(): Promise<Models.User<Models.DefaultPreferences> | null> {
  const sessionSecret = await getSessionSecret();

  if (!sessionSecret) {
    return null;
  }

  try {
    return await withAppwriteRetry(
      () => createSessionAccount(sessionSecret).get(),
      { label: "Verify Appwrite session" },
    );
  } catch (error) {
    logDevelopmentError("Authenticated session could not be verified", error);
    return null;
  }
}
