import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import {
  bucketToYears,
  isDifficulty,
  isExperienceBucket,
  isInterviewFocus,
} from "@/lib/interviewOptions";
import { getCurrentUser } from "@/lib/session";

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || (body.action !== "complete" && body.action !== "skip")) {
    return NextResponse.json({ error: "invalid action" }, { status: 400 });
  }

  const userRef = adminDb.collection("users").doc(user.uid);

  if (body.action === "skip") {
    await userRef.set({ onboardingStatus: "skipped" }, { merge: true });
    return NextResponse.json({ success: true });
  }

  const {
    displayName,
    targetRole,
    targetCompany,
    defaultExperienceBucket,
    defaultInterviewFocus,
    defaultDifficulty,
  } = body;

  // displayName + targetRole are the only fields onboarding actually collects.
  // The rest are optional here so the Profile page (which sends all of them)
  // and onboarding (which doesn't) can share this same endpoint.
  if (
    typeof displayName !== "string" ||
    !displayName.trim() ||
    typeof targetRole !== "string" ||
    !targetRole.trim() ||
    (targetCompany !== undefined && typeof targetCompany !== "string") ||
    (defaultExperienceBucket !== undefined && !isExperienceBucket(defaultExperienceBucket)) ||
    (defaultInterviewFocus !== undefined && !isInterviewFocus(defaultInterviewFocus)) ||
    (defaultDifficulty !== undefined && !isDifficulty(defaultDifficulty))
  ) {
    return NextResponse.json({ error: "missing or invalid fields" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {
    displayName: displayName.trim(),
    targetRole: targetRole.trim(),
    onboardingStatus: "completed",
  };
  if (typeof targetCompany === "string") {
    updates.targetCompany = targetCompany.trim();
  }
  if (isExperienceBucket(defaultExperienceBucket)) {
    updates.defaultExperienceBucket = defaultExperienceBucket;
    updates.defaultYearsOfExperience = bucketToYears(defaultExperienceBucket);
  }
  if (isInterviewFocus(defaultInterviewFocus)) {
    updates.defaultInterviewFocus = defaultInterviewFocus;
  }
  if (isDifficulty(defaultDifficulty)) {
    updates.defaultDifficulty = defaultDifficulty;
  }

  await userRef.set(updates, { merge: true });

  return NextResponse.json({ success: true });
}
