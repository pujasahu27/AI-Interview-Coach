import { NextResponse } from "next/server";
import { adminDb, FieldValue } from "@/lib/firebase-admin";
import {
  describeGeminiError,
  evaluateAnswerAndGenerateNext,
  type Difficulty,
  type InterviewFocus,
} from "@/lib/gemini";
import { isUnlimitedActive } from "@/lib/credits";
import { getCurrentUser } from "@/lib/session";

type RouteContext = { params: Promise<{ sessionId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { sessionId } = await context.params;
  const body = await request.json().catch(() => null);
  const answerTranscript = body?.answerTranscript;
  if (typeof answerTranscript !== "string" || !answerTranscript.trim()) {
    return NextResponse.json({ error: "answerTranscript is required" }, { status: 400 });
  }

  const sessionRef = adminDb.collection("interviewSessions").doc(sessionId);
  const sessionSnap = await sessionRef.get();
  if (!sessionSnap.exists || sessionSnap.data()?.uid !== user.uid) {
    return NextResponse.json({ error: "session not found" }, { status: 404 });
  }
  const session = sessionSnap.data()!;
  if (session.status !== "active") {
    return NextResponse.json({ error: "session is not active" }, { status: 409 });
  }

  const userSnap = await adminDb.collection("users").doc(user.uid).get();
  const userData = userSnap.data();
  const freeTurnsUsed = (userData?.freeTurnsUsed as number) ?? 0;
  const freeTurnsLimit = (userData?.freeTurnsLimit as number) ?? 0;
  if (!isUnlimitedActive(userData) && freeTurnsUsed >= freeTurnsLimit) {
    return NextResponse.json({ error: "credits exhausted" }, { status: 402 });
  }

  const turnCount = session.turnCount as number;
  const maxTurns = session.maxTurns as number;
  const currentTurnRef = sessionRef.collection("turns").doc(String(turnCount));
  const currentTurnSnap = await currentTurnRef.get();
  if (!currentTurnSnap.exists) {
    return NextResponse.json({ error: "no pending question" }, { status: 409 });
  }
  const currentQuestion = currentTurnSnap.data()!.question as string;

  const allTurnsSnap = await sessionRef.collection("turns").get();
  const transcript = allTurnsSnap.docs
    .map((doc) => ({ id: Number(doc.id), data: doc.data() }))
    .filter((t) => t.id < turnCount)
    .sort((a, b) => a.id - b.id)
    .map((t) => ({
      question: t.data.question as string,
      answerTranscript: t.data.answerTranscript as string,
      evaluation: t.data.evaluation,
    }));

  const resumeSnap = await adminDb.collection("resumes").doc(session.resumeId).get();
  const resume = resumeSnap.data()!;

  let result;
  try {
    result = await evaluateAnswerAndGenerateNext(
      {
        resumeText: resume.rawText,
        jobDescriptionText: resume.jobDescriptionText,
        yearsOfExperience: resume.yearsOfExperience,
        interviewFocus: resume.interviewFocus as InterviewFocus,
        difficulty: (resume.difficulty as Difficulty) ?? "intermediate",
        targetCompany: (resume.targetCompany as string) || null,
      },
      transcript,
      currentQuestion,
      answerTranscript,
    );
  } catch (error) {
    console.error("evaluateAnswerAndGenerateNext failed:", error);
    const { status, message } = describeGeminiError(error);
    return NextResponse.json({ error: message }, { status });
  }

  const isSessionComplete = turnCount + 1 >= maxTurns;

  await adminDb.runTransaction(async (transaction) => {
    const freshUserSnap = await transaction.get(adminDb.collection("users").doc(user.uid));
    const freshUsed = (freshUserSnap.data()?.freeTurnsUsed as number) ?? 0;
    const freshLimit = (freshUserSnap.data()?.freeTurnsLimit as number) ?? 0;
    if (!isUnlimitedActive(freshUserSnap.data()) && freshUsed >= freshLimit) {
      throw new Error("credits exhausted");
    }

    transaction.update(currentTurnRef, {
      answerTranscript,
      evaluation: result.evaluation,
    });
    transaction.update(sessionRef, {
      turnCount: turnCount + 1,
      status: isSessionComplete ? "completed" : "active",
    });
    if (!isSessionComplete) {
      transaction.set(sessionRef.collection("turns").doc(String(turnCount + 1)), {
        question: result.nextQuestion,
        answerTranscript: null,
        evaluation: null,
        createdAt: FieldValue.serverTimestamp(),
      });
    }
    transaction.update(adminDb.collection("users").doc(user.uid), {
      freeTurnsUsed: freshUsed + 1,
    });
  });

  return NextResponse.json({
    evaluation: result.evaluation,
    nextQuestion: isSessionComplete ? null : result.nextQuestion,
    isSessionComplete,
  });
}
