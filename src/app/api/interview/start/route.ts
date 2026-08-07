import { NextResponse } from "next/server";
import { adminDb, FieldValue } from "@/lib/firebase-admin";
import { describeGeminiError, generateOpeningQuestion, type Difficulty, type InterviewFocus } from "@/lib/gemini";
import { bucketToYears, isDifficulty, isExperienceBucket, isInterviewFocus } from "@/lib/interviewOptions";
import { getCurrentUser } from "@/lib/session";

const MAX_TURNS = 7;

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const resumeId = body?.resumeId;
  if (typeof resumeId !== "string" || !resumeId) {
    return NextResponse.json({ error: "resumeId is required" }, { status: 400 });
  }

  const resumeRef = adminDb.collection("resumes").doc(resumeId);
  const resumeSnap = await resumeRef.get();
  if (!resumeSnap.exists || resumeSnap.data()?.uid !== user.uid) {
    return NextResponse.json({ error: "resume not found" }, { status: 404 });
  }
  let resume = resumeSnap.data()!;

  const experienceBucket = body?.experienceBucket;
  const interviewFocus = body?.interviewFocus;
  const difficulty = body?.difficulty;
  const targetCompany = body?.targetCompany;
  const overrides: Record<string, unknown> = {};
  if (isExperienceBucket(experienceBucket)) {
    overrides.experienceBucket = experienceBucket;
    overrides.yearsOfExperience = bucketToYears(experienceBucket);
  }
  if (isInterviewFocus(interviewFocus)) {
    overrides.interviewFocus = interviewFocus;
  }
  if (isDifficulty(difficulty)) {
    overrides.difficulty = difficulty;
  }
  if (typeof targetCompany === "string") {
    overrides.targetCompany = targetCompany.trim();
  }
  if (Object.keys(overrides).length > 0) {
    resume = { ...resume, ...overrides };
  }

  let question: string;
  try {
    // The resume-override write doesn't need to finish before the LLM call
    // starts — they're independent, so run them together instead of paying
    // for the write's latency on top of the (much longer) generation call.
    const [openingQuestion] = await Promise.all([
      generateOpeningQuestion({
        resumeText: resume.rawText,
        jobDescriptionText: resume.jobDescriptionText,
        yearsOfExperience: resume.yearsOfExperience,
        interviewFocus: resume.interviewFocus as InterviewFocus,
        difficulty: (resume.difficulty as Difficulty) ?? "intermediate",
        targetCompany: (resume.targetCompany as string) || null,
      }),
      Object.keys(overrides).length > 0 ? resumeRef.update(overrides) : null,
    ]);
    question = openingQuestion;
  } catch (error) {
    console.error("generateOpeningQuestion failed:", error);
    const { status, message } = describeGeminiError(error);
    return NextResponse.json({ error: message }, { status });
  }

  const sessionRef = adminDb.collection("interviewSessions").doc();
  await Promise.all([
    sessionRef.set({
      uid: user.uid,
      resumeId,
      status: "active",
      turnCount: 0,
      maxTurns: MAX_TURNS,
      recommendationsSummary: null,
      overallScore: null,
      createdAt: FieldValue.serverTimestamp(),
    }),
    sessionRef.collection("turns").doc("0").set({
      question,
      answerTranscript: null,
      evaluation: null,
      createdAt: FieldValue.serverTimestamp(),
    }),
  ]);

  return NextResponse.json(
    { sessionId: sessionRef.id, question, maxTurns: MAX_TURNS },
    { status: 201 },
  );
}
