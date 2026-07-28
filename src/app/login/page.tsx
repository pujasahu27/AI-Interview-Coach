import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { Orb } from "@/components/ui/Orb";
import { getCurrentUser } from "@/lib/session";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-background px-6 py-16">
      <div className="flex flex-col items-center gap-7">
        <Orb size={56} />
        <h1 className="font-serif text-3xl font-normal tracking-tight text-white">
          AI Interview Coach
        </h1>
        <LoginForm />
      </div>
    </div>
  );
}
