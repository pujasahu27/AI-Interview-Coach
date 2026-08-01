import { redirect } from "next/navigation";
import { HeroOrbDemo } from "@/components/HeroOrbDemo";
import { MarketingFooter } from "@/components/MarketingFooter";
import { MarketingNav } from "@/components/MarketingNav";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CircularScore } from "@/components/ui/CircularScore";
import { Orb } from "@/components/ui/Orb";
import { Reveal } from "@/components/ui/Reveal";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { Tag } from "@/components/ui/Tag";
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
      <MarketingNav />

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

        <div className="animate-fade-up mt-24" style={{ animationDelay: "380ms" }}>
          <HeroOrbDemo />
        </div>
      </section>

      <section className="relative overflow-hidden bg-surface px-6 py-32">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(900px circle at 50% 0%, rgba(240,180,41,.08) 0%, transparent 60%)" }}
        />
        <Reveal className="relative z-10 mx-auto mb-16 max-w-xl text-center">
          <span className="mb-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[.14em] text-sub before:h-px before:w-5 before:bg-muted before:content-[''] after:h-px after:w-5 after:bg-muted after:content-['']">
            Real feedback
          </span>
          <h2 className="font-serif text-[clamp(36px,6vw,60px)] font-normal leading-none tracking-tight text-white">
            You talked. <em className="text-gold italic">Our AI</em> listened.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-lg leading-relaxed text-body">
            Every answer gets scored on the spot — what worked, what didn&apos;t, and why.
          </p>
        </Reveal>

        <Reveal className="relative z-10 mx-auto max-w-md">
          <span className="absolute -left-4 top-6 hidden -translate-x-full whitespace-nowrap rounded-full border border-line2 bg-surface-elevated px-3.5 py-1.5 font-mono text-[11px] text-sub shadow-[0_12px_24px_-12px_rgba(0,0,0,.7)] lg:block">
            Instant analysis
          </span>
          <span className="absolute -right-4 top-[38%] hidden translate-x-full whitespace-nowrap rounded-full border border-line2 bg-surface-elevated px-3.5 py-1.5 font-mono text-[11px] text-sub shadow-[0_12px_24px_-12px_rgba(0,0,0,.7)] lg:block">
            AI-powered questions
          </span>
          <span className="absolute -left-6 bottom-8 hidden -translate-x-full whitespace-nowrap rounded-full border border-gold/25 bg-gold-faint px-3.5 py-1.5 font-mono text-[11px] text-gold shadow-[0_12px_24px_-12px_rgba(0,0,0,.7)] lg:block">
            Resume-specific
          </span>

          <div className="rounded-[24px] border border-line2 bg-background p-7 shadow-[inset_0_1px_0_rgba(255,255,255,.04),0_30px_60px_-30px_rgba(0,0,0,.85)]">
            <div className="mb-6 flex items-center justify-between">
              <p className="font-mono text-[11px] uppercase tracking-[.12em] text-muted">
                Analysis by AI
              </p>
              <Tag tone="gold">Job specific</Tag>
            </div>
            <div className="mb-5 flex items-center gap-6">
              <CircularScore value={8} size={84} />
              <div>
                <p className="font-serif text-2xl font-normal text-white">Strong answer</p>
                <p className="text-sm text-sub">Grounded in real examples, clear structure.</p>
              </div>
            </div>
            <div>
              <ScoreBar label="Content relevance" value={9} />
              <ScoreBar label="Communication" value={7} />
              <ScoreBar label="Confidence" value={8} />
            </div>
          </div>
        </Reveal>
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

      <MarketingFooter />
    </div>
  );
}
