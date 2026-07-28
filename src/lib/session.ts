import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { adminAuth } from "@/lib/firebase-admin";

const SESSION_COOKIE_NAME = "session";
const SESSION_COOKIE_MAX_AGE_DAYS = Number(
  process.env.SESSION_COOKIE_MAX_AGE_DAYS ?? 5,
);

export type SessionUser = {
  uid: string;
  email: string | null;
};

export async function createSessionCookie(
  idToken: string,
): Promise<{ name: string; value: string; maxAgeSeconds: number }> {
  const maxAgeMs = SESSION_COOKIE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  const value = await adminAuth.createSessionCookie(idToken, {
    expiresIn: maxAgeMs,
  });
  return { name: SESSION_COOKIE_NAME, value, maxAgeSeconds: maxAgeMs / 1000 };
}

// cache() dedupes verification within a single request/render pass.
export const getCurrentUser = cache(
  async (): Promise<SessionUser | null> => {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!sessionCookie) {
      return null;
    }
    try {
      const decoded = await adminAuth.verifySessionCookie(
        sessionCookie,
        true,
      );
      return { uid: decoded.uid, email: decoded.email ?? null };
    } catch {
      return null;
    }
  },
);

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};
