import { NextResponse } from "next/server";
import { adminDb, FieldValue } from "@/lib/firebase-admin";
import { describeGeminiError, generateRecommendations } from "@/lib/gemini";
import { getCurrentUser } from "@/lib/session";

type RouteContext = { params: Promise<{ sessionId: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { sessionId } = await context.params;
  const sessionRef = adminDb.collection("interviewSessions").doc(sessionId);
  const sessionSnap = await sessionRef.get();
  if (!sessionSnap.exists || sessionSnap.data()?.uid !== user.uid) {
    return NextResponse.json({ error: "session not found" }, { status: 404 });
  }
  const session = sessionSnap.data()!;

  const turnsSnap = await sessionRef.collection("turns").get();
  const completedTurns = turnsSnap.docs
    .map((doc) => ({ id: Number(doc.id), data: doc.data() }))
    .filter((t) => t.data.evaluation != null)
    .sort((a, b) => a.id - b.id)
    .map((t) => ({
      question: t.data.question as string,
      answerTranscript: t.data.answerTranscript as string,
      evaluation: t.data.evaluation,
    }));

  const timeline = completedTurns.map((t) => ({
    question: t.question,
    score: t.evaluation.score as number,
  }));

  if (session.recommendationsSummary) {
    return NextResponse.json({
      overallScore: session.overallScore,
      recommendationsSummary: session.recommendationsSummary,
      timeline,
    });
  }

  if (completedTurns.length === 0) {
    return NextResponse.json(
      { error: "no completed turns to summarize" },
      { status: 400 },
    );
  }

  const [resumeSnap, userSnap] = await Promise.all([
    adminDb.collection("resumes").doc(session.resumeId).get(),
    adminDb.collection("users").doc(user.uid).get(),
  ]);
  const resume = resumeSnap.data()!;
  const targetRole = (userSnap.data()?.targetRole as string) ?? null;

  let summary;
  try {
    summary = await generateRecommendations(
      {
        yearsOfExperience: resume.yearsOfExperience,
        interviewFocus: resume.interviewFocus,
        difficulty: resume.difficulty ?? "intermediate",
      },
      targetRole,
      completedTurns,
    );
  } catch (error) {
    console.error("generateRecommendations failed:", error);
    const { status, message } = describeGeminiError(error);
    return NextResponse.json({ error: message }, { status });
  }

  await sessionRef.update({
    status: "completed",
    overallScore: summary.overallScore,
    recommendationsSummary: summary,
    endedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({
    overallScore: summary.overallScore,
    recommendationsSummary: summary,
    timeline,
  });
}
