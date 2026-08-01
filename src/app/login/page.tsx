import { redirect } from "next/navigation";
import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";
import { Orb } from "@/components/ui/Orb";
import { getCurrentUser } from "@/lib/session";

const VALUE_PROPS = [
  {
    title: "Adaptive AI interviewer",
    body: "Questions that respond to your answers — probing weak spots, moving past strong ones.",
  },
  {
    title: "Resume & JD aware",
    body: "Every question is grounded in your real experience and the role you're targeting.",
  },
  {
    title: "Voice practice, free",
    body: "Speak your answers right in the browser — no paid transcription service.",
  },
  {
    title: "Instant, structured feedback",
    body: "A detailed score and study plan after every session, not just a pass/fail.",
  },
];

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden flex-1 flex-col justify-center gap-10 bg-background px-16 lg:flex">
        <Link href="/" className="flex items-center gap-2.5 text-lg font-semibold text-white">
          <Orb size={28} />
          AI Interview Coach
        </Link>
        <h1 className="max-w-md font-serif text-[clamp(30px,3.2vw,42px)] font-normal leading-[1.1] tracking-tight text-white">
          Struggling to feel ready for interviews?{" "}
          <em className="text-gold italic">Practice</em> until you are.
        </h1>
        <ul className="max-w-sm space-y-4 border-l border-line2 pl-6">
          {VALUE_PROPS.map((v) => (
            <li key={v.title} className="flex items-start gap-2.5">
              <span className="mt-0.5 shrink-0 text-gold">✓</span>
              <p className="text-sm leading-relaxed text-body">
                <span className="font-medium text-foreground">{v.title}</span> — {v.body}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-16"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(240,180,41,.9) 0%, rgba(232,97,74,.9) 55%, rgba(124,110,245,.9) 100%)",
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-black/25" />
        <div className="relative z-10 flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-3 lg:hidden">
            <Orb size={48} />
            <p className="font-serif text-xl font-normal text-white">AI Interview Coach</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
