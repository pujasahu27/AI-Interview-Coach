import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/OnboardingForm";
import { adminDb } from "@/lib/firebase-admin";
import { requireUser } from "@/lib/session";

export default async function OnboardingPage() {
  const user = await requireUser();

  const snapshot = await adminDb.collection("users").doc(user.uid).get();
  if (!snapshot.exists || snapshot.data()?.onboardingStatus !== "pending") {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-background px-6 py-16">
      <OnboardingForm />
    </div>
  );
}
