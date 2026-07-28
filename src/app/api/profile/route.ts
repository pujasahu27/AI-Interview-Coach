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

  if (
    typeof displayName !== "string" ||
    !displayName.trim() ||
    typeof targetRole !== "string" ||
    !targetRole.trim() ||
    (targetCompany !== undefined && typeof targetCompany !== "string") ||
    !isExperienceBucket(defaultExperienceBucket) ||
    !isInterviewFocus(defaultInterviewFocus) ||
    !isDifficulty(defaultDifficulty)
  ) {
    return NextResponse.json({ error: "missing or invalid fields" }, { status: 400 });
  }

  await userRef.set(
    {
      displayName: displayName.trim(),
      targetRole: targetRole.trim(),
      targetCompany: typeof targetCompany === "string" ? targetCompany.trim() : "",
      defaultExperienceBucket,
      defaultYearsOfExperience: bucketToYears(defaultExperienceBucket),
      defaultInterviewFocus,
      defaultDifficulty,
      onboardingStatus: "completed",
    },
    { merge: true },
  );

  return NextResponse.json({ success: true });
}
