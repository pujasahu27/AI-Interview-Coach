import { redirect } from "next/navigation";
import { FinalReport } from "@/components/FinalReport";
import { adminDb } from "@/lib/firebase-admin";
import { requireUser } from "@/lib/session";

type RouteParams = { params: Promise<{ sessionId: string }> };

export default async function InterviewSummaryPage({ params }: RouteParams) {
  const user = await requireUser();
  const { sessionId } = await params;

  const sessionSnap = await adminDb.collection("interviewSessions").doc(sessionId).get();
  if (!sessionSnap.exists || sessionSnap.data()?.uid !== user.uid) {
    redirect("/dashboard");
  }

  return <FinalReport sessionId={sessionId} />;
}
