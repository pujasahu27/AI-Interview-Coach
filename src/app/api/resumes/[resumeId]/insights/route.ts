import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { describeGeminiError, generateResumeInsights } from "@/lib/gemini";
import { getCurrentUser } from "@/lib/session";

type RouteContext = { params: Promise<{ resumeId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { resumeId } = await context.params;
  const resumeSnap = await adminDb.collection("resumes").doc(resumeId).get();
  if (!resumeSnap.exists || resumeSnap.data()?.uid !== user.uid) {
    return NextResponse.json({ error: "resume not found" }, { status: 404 });
  }
  const resume = resumeSnap.data()!;

  try {
    const insights = await generateResumeInsights(
      resume.rawText,
      resume.jobDescriptionText,
    );
    return NextResponse.json(insights);
  } catch (error) {
    console.error("generateResumeInsights failed:", error);
    const { status, message } = describeGeminiError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
