import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  adminAuth,
  adminDb,
  FieldValue,
} from "@/lib/firebase-admin";
import {
  clearSessionCookie,
  createSessionCookie,
  sessionCookieOptions,
} from "@/lib/session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const idToken = body?.idToken;
  if (typeof idToken !== "string" || !idToken) {
    return NextResponse.json({ error: "idToken is required" }, { status: 400 });
  }

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(idToken);
  } catch {
    return NextResponse.json({ error: "invalid idToken" }, { status: 401 });
  }

  const { value, maxAgeSeconds, name } = await createSessionCookie(idToken);
  const cookieStore = await cookies();
  cookieStore.set(name, value, {
    ...sessionCookieOptions,
    maxAge: maxAgeSeconds,
  });

  const userRef = adminDb.collection("users").doc(decoded.uid);
  const snapshot = await userRef.get();
  if (!snapshot.exists) {
    await userRef.set({
      email: decoded.email ?? null,
      displayName: null,
      targetRole: null,
      defaultYearsOfExperience: null,
      defaultInterviewFocus: null,
      onboardingStatus: "pending",
      freeTurnsUsed: 0,
      freeTurnsLimit: 7,
      plan: "free",
      createdAt: FieldValue.serverTimestamp(),
    });
  } else {
    await userRef.set({ email: decoded.email ?? null }, { merge: true });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE() {
  await clearSessionCookie();
  return NextResponse.json({ success: true });
}
