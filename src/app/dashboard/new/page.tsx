import { redirect } from "next/navigation";
import Link from "next/link";
import { InterviewWizard } from "@/components/InterviewWizard";
import { Orb } from "@/components/ui/Orb";
import { adminDb } from "@/lib/firebase-admin";
import { nearestExperienceBucket } from "@/lib/interviewOptions";
import { requireUser } from "@/lib/session";

export default async function NewInterviewPage() {
  const user = await requireUser();

  const userSnapshot = await adminDb.collection("users").doc(user.uid).get();
  const userData = userSnapshot.data();
  if (!userSnapshot.exists || userData?.onboardingStatus === "pending") {
    redirect("/onboarding");
  }

  const resumeQuery = await adminDb
    .collection("resumes")
    .where("uid", "==", user.uid)
    .get();
  const lastResumeDoc = resumeQuery.docs.sort(
    (a, b) =>
      (b.data().createdAt?.toMillis() ?? 0) - (a.data().createdAt?.toMillis() ?? 0),
  )[0];
  const lastResume = lastResumeDoc
    ? {
        id: lastResumeDoc.id,
        yearsOfExperience: lastResumeDoc.data().yearsOfExperience,
        interviewFocus: lastResumeDoc.data().interviewFocus,
        preview: (lastResumeDoc.data().rawText as string).slice(0, 200),
      }
    : null;

  const profileDefaults = {
    experienceBucket:
      userData?.defaultExperienceBucket ??
      nearestExperienceBucket((userData?.defaultYearsOfExperience as number) ?? 0),
    interviewFocus: userData?.defaultInterviewFocus ?? "mixed",
    difficulty: userData?.defaultDifficulty ?? "intermediate",
    targetCompany: userData?.targetCompany ?? "",
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-line bg-background/80 px-7 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Orb size={18} />
          AI Interview Coach
        </div>
        <Link
          href="/dashboard"
          className="group flex items-center gap-1.5 text-[13px] text-sub transition-colors hover:text-foreground"
        >
          <span className="transition-transform duration-200 group-hover:-translate-x-1">←</span>
          Back to dashboard
        </Link>
      </div>
      <div className="flex flex-1 flex-col items-center px-6 py-14">
        <InterviewWizard profileDefaults={profileDefaults} lastResume={lastResume} />
      </div>
    </div>
  );
}
