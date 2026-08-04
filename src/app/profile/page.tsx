import { Card } from "@/components/ui/Card";
import { Sidebar } from "@/components/ui/Sidebar";
import { ProfileForm } from "@/components/ProfileForm";
import { creditStatusFromUserData, hasCreditsRemaining } from "@/lib/credits";
import { adminDb } from "@/lib/firebase-admin";
import { nearestExperienceBucket } from "@/lib/interviewOptions";
import { requireUser } from "@/lib/session";

export default async function ProfilePage() {
  const user = await requireUser();
  const userSnap = await adminDb.collection("users").doc(user.uid).get();
  const userData = userSnap.data();
  const credits = creditStatusFromUserData(userData);

  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      <Sidebar
        active="profile"
        userLabel={userData?.displayName || "You"}
        userPlan={
          credits.unlimited
            ? "Unlimited plan"
            : hasCreditsRemaining(credits)
              ? "Free plan"
              : "Free plan (exhausted)"
        }
      />
      <div className="flex-1 px-4 py-9 sm:px-8">
        <h1 className="mb-7 font-serif text-[28px] font-normal tracking-tight text-white">
          Profile
        </h1>

        <div className="mx-auto max-w-xl space-y-4">
          <Card className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <div className="min-w-0">
              <p className="text-sm text-sub">Signed in as</p>
              <p className="truncate font-medium text-foreground">{userData?.email}</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm text-sub">
                {credits.unlimited ? "Plan" : "Free turns"}
              </p>
              <p className="font-mono font-medium text-gold">
                {credits.unlimited
                  ? `Unlimited until ${new Date(credits.unlimitedUntil!).toLocaleDateString()}`
                  : `${credits.used} / ${credits.limit} used`}
              </p>
            </div>
          </Card>

          <Card>
            <ProfileForm
              initial={{
                displayName: userData?.displayName ?? "",
                targetRole: userData?.targetRole ?? "",
                targetCompany: userData?.targetCompany ?? "",
                defaultExperienceBucket:
                  userData?.defaultExperienceBucket ??
                  nearestExperienceBucket(userData?.defaultYearsOfExperience ?? 0),
                defaultInterviewFocus: userData?.defaultInterviewFocus ?? "mixed",
                defaultDifficulty: userData?.defaultDifficulty ?? "intermediate",
              }}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
