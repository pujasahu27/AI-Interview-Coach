import { redirect } from "next/navigation";
import { InterviewScreen } from "@/components/InterviewScreen";
import { adminDb } from "@/lib/firebase-admin";
import { requireUser } from "@/lib/session";

type RouteParams = { params: Promise<{ sessionId: string }> };

export default async function InterviewPage({ params }: RouteParams) {
  const user = await requireUser();
  const { sessionId } = await params;

  const sessionSnap = await adminDb.collection("interviewSessions").doc(sessionId).get();
  if (!sessionSnap.exists || sessionSnap.data()?.uid !== user.uid) {
    redirect("/dashboard");
  }
  const session = sessionSnap.data()!;
  if (session.status === "completed") {
    redirect(`/interview/${sessionId}/summary`);
  }

  const turnSnap = await adminDb
    .collection("interviewSessions")
    .doc(sessionId)
    .collection("turns")
    .doc(String(session.turnCount))
    .get();
  const question = turnSnap.data()?.question as string;

  return (
    <InterviewScreen
      sessionId={sessionId}
      initialQuestion={question}
      initialTurnNumber={session.turnCount + 1}
      maxTurns={session.maxTurns}
    />
  );
}
