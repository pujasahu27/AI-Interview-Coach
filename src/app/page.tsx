import { redirect } from "next/navigation";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Orb } from "@/components/ui/Orb";
import { Reveal } from "@/components/ui/Reveal";
import { getCurrentUser } from "@/lib/session";

const HOW_STEPS = [
  {
    n: "01",
    title: "Upload & set up",
    body: "Add your resume and the job description. We tailor every question to your actual experience and the role you're targeting.",
  },
  {
    n: "02",
    title: "Talk it out, out loud",
    body: "A natural voice conversation — real questions, real follow-ups. No scripts, no rigid question bank.",
  },
  {
    n: "03",
    title: "Get your report",
    body: "Minutes later, a structured report on strengths and gaps, with a personalized study plan for what to work on next.",
  },
];

const FEATURES = [
  {
    tag: "Adaptive AI",
    title: "Every answer steers the next question",
    body: "Weak spots get probed deeper. Strong answers move the conversation forward — exactly like a sharp interviewer would.",
  },
  {
    tag: "Voice, in your browser",
    title: "Speak your answers, free",
    body: "Built on the browser's native speech APIs — no paid transcription service, with a text fallback if voice isn't supported.",
  },
  {
    tag: "Resume-aware",
    title: "Questions from your real resume",
    body: "Not a generic template — every question is grounded in your resume and the job description you're preparing for.",
  },
];

export default async function Home() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div>
      <nav className="fixed inset-x-0 top-0 z-50 flex h-[68px] items-center justify-between border-b border-line bg-background/70 px-6 backdrop-blur-md sm:px-12">
        <div className="flex items-center gap-2.5 text-[17px] font-semibold text-white">
          <Orb size={26} />
          AI Interview Coach
        </div>
        <div className="flex items-center gap-3">
          <LinkButton href="/login" variant="ghost" size="sm">
            Log in
          </LinkButton>
          <LinkButton href="/login" variant="gold" size="sm">
            Start free
          </LinkButton>
        </div>
      </nav>

      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pb-20 pt-36 text-center">
        <div
          className="pointer-events-none absolute -top-52 left-1/2 h-[500px] w-[900px] -translate-x-1/2"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(240,180,41,.12) 0%, transparent 65%)" }}
        />
        <div className="animate-fade-up mb-10 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold-faint px-4 py-1.5 font-mono text-[11px] uppercase tracking-[.14em] text-gold">
          <span className="h-1.5 w-1.5 animate-blink rounded-full bg-gold" />
          Voice AI-powered mock interviews
        </div>
        <h1 className="animate-fade-up font-serif text-[clamp(48px,10vw,120px)] font-normal leading-[.95] tracking-tight text-white" style={{ animationDelay: "70ms" }}>
          Interview <em className="text-gold italic">like</em>
          <br />
          <span className="text-sub">never before.</span>
        </h1>
        <p className="animate-fade-up mt-8 max-w-lg text-lg leading-relaxed text-body" style={{ animationDelay: "150ms" }}>
          An AI interviewer that talks with you like a real one — adapting every
          question to your answers — then tells you precisely how to improve.
        </p>
        <div className="animate-fade-up mt-11 flex flex-wrap justify-center gap-3.5" style={{ animationDelay: "220ms" }}>
          <LinkButton href="/login" variant="gold" size="lg">
            Start a free mock interview
          </LinkButton>
        </div>
        <p className="animate-fade-up mt-[18px] font-mono text-[12.5px] text-muted" style={{ animationDelay: "320ms" }}>
          {"// free to start"} &middot; runs in your browser
        </p>

        <div className="animate-fade-up mt-24 flex flex-col items-center gap-5" style={{ animationDelay: "380ms" }}>
          <div className="flex items-center gap-2.5 rounded-full border border-line2 bg-surface-elevated px-5 py-3 text-sm text-body">
            <span className="flex h-[18px] items-center gap-[3px]">
              {[5, 14, 9, 18, 11, 7, 15].map((h, i) => (
                <span
                  key={i}
                  className="animate-wave-bar w-[2.5px] rounded-full bg-gold"
                  style={{ height: h, animationDelay: `${-1.05 + i * 0.15}s` }}
                />
              ))}
            </span>
            Listening&hellip;
          </div>
          <Orb size={200} withRings />
          <p className="font-mono text-[11px] uppercase tracking-[.12em] text-muted">
            Your AI Interviewer
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-32">
        <Reveal className="mx-auto mb-16 max-w-xl text-center">
          <span className="mb-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[.14em] text-sub before:h-px before:w-5 before:bg-muted before:content-[''] after:h-px after:w-5 after:bg-muted after:content-['']">
            How it works
          </span>
          <h2 className="font-serif text-[clamp(36px,6vw,60px)] font-normal leading-none tracking-tight text-white">
            Practice like a <em className="text-gold italic">real</em> interview.
          </h2>
        </Reveal>
        <div className="grid gap-px overflow-hidden rounded-[20px] border border-line bg-line sm:grid-cols-3">
          {HOW_STEPS.map((step, i) => (
            <Reveal key={step.n} delay={i * 80} className="bg-surface p-10">
              <div className="mb-8 flex items-center gap-2.5 font-mono text-xs text-muted after:h-px after:flex-1 after:bg-line2 after:content-['']">
                {step.n}
              </div>
              <h3 className="mb-3.5 font-serif text-[26px] font-normal leading-tight text-white">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-body">{step.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-surface px-6 py-32">
        <Reveal className="mx-auto mb-16 max-w-xl text-center">
          <span className="mb-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[.14em] text-sub before:h-px before:w-5 before:bg-muted before:content-[''] after:h-px after:w-5 after:bg-muted after:content-['']">
            Features
          </span>
          <h2 className="font-serif text-[clamp(36px,6vw,60px)] font-normal leading-none tracking-tight text-white">
            An interviewer that <em className="text-gold italic">actually</em> listens.
          </h2>
        </Reveal>
        <div className="mx-auto grid max-w-5xl gap-3 sm:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.tag} delay={i * 80}>
              <Card className="h-full transition-transform hover:-translate-y-1">
                <span className="mb-4 block font-mono text-[10.5px] uppercase tracking-[.12em] text-muted">
                  {f.tag}
                </span>
                <h3 className="mb-3 font-serif text-2xl font-normal leading-tight text-white">
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed text-body">{f.body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden px-6 py-40 text-center">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(900px circle at 50% 80%, rgba(240,180,41,.09) 0%, transparent 60%)" }}
        />
        <Reveal className="relative z-10 mb-12 flex justify-center">
          <Orb size={100} />
        </Reveal>
        <Reveal className="relative z-10">
          <h2 className="mx-auto max-w-3xl font-serif text-[clamp(40px,7vw,80px)] font-normal leading-[.95] tracking-tight text-white">
            Practice feels different
            <br />
            when <em className="text-gold italic">something is grading you.</em>
          </h2>
          <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-body">
            Set up your first mock interview in under two minutes.
          </p>
          <div className="mt-11">
            <LinkButton href="/login" variant="gold" size="lg">
              Start practicing free
            </LinkButton>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-line px-6 py-10 text-center">
        <p className="font-mono text-xs text-muted">
          &copy; {new Date().getFullYear()} AI Interview Coach &middot; Interview like never before.
        </p>
      </footer>
    </div>
  );
}
