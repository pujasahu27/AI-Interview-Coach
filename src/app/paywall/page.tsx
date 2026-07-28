import { PaywallPlans } from "@/components/PaywallPlans";
import { Sidebar } from "@/components/ui/Sidebar";
import { getCreditStatus, hasCreditsRemaining } from "@/lib/credits";
import { adminDb } from "@/lib/firebase-admin";
import { isRazorpayConfigured } from "@/lib/razorpay";
import { requireUser } from "@/lib/session";

export default async function PaywallPage() {
  const user = await requireUser();
  const credits = await getCreditStatus(user.uid);
  const userSnap = await adminDb.collection("users").doc(user.uid).get();
  const userData = userSnap.data();
  const canInterview = hasCreditsRemaining(credits);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        active="dashboard"
        userLabel={userData?.displayName || "You"}
        userPlan={
          credits.unlimited ? "Unlimited plan" : canInterview ? "Free plan" : "Free plan (exhausted)"
        }
      />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-coral text-2xl font-bold text-on-accent">
          !
        </span>
        <h1 className="font-serif text-3xl font-normal tracking-tight text-white">
          {canInterview ? "Need more interview turns?" : "You've used all your free turns"}
        </h1>
        <p className="max-w-md text-sub">
          You&apos;ve used {credits.used} of {credits.limit} free interview turns. Top up below to
          keep practicing with adaptive mock interviews.
        </p>

        <PaywallPlans
          configured={isRazorpayConfigured()}
          userEmail={userData?.email ?? ""}
          userName={userData?.displayName ?? ""}
        />
      </div>
    </div>
  );
}
