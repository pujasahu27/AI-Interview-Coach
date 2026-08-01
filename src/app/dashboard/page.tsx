import Link from "next/link";
import { redirect } from "next/navigation";
import { LinkButton } from "@/components/ui/Button";
import { Counter } from "@/components/ui/Counter";
import { Orb } from "@/components/ui/Orb";
import { Reveal } from "@/components/ui/Reveal";
import { Sidebar } from "@/components/ui/Sidebar";
import { Tag } from "@/components/ui/Tag";
import { getCreditStatus, hasCreditsRemaining } from "@/lib/credits";
import { adminDb } from "@/lib/firebase-admin";
import { requireUser } from "@/lib/session";

type SessionDoc = {
  id: string;
  status: string;
  turnCount: number;
  maxTurns: number;
  overallScore: number | null;
  createdAt?: { toMillis(): number; toDate(): Date };
};

const ICONS = {
  bolt: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  mic: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
    </svg>
  ),
  check: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.5 2.5 5-5" />
    </svg>
  ),
  star: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9 12 2" />
    </svg>
  ),
};

const KPI_ACCENTS = {
  gold: "bg-gold/15 text-gold",
  violet: "bg-violet/15 text-violet",
  green: "bg-green/15 text-green",
  coral: "bg-coral/15 text-coral",
};

const CARD_SHADOW =
  "shadow-[inset_0_1px_0_rgba(255,255,255,.04),0_20px_40px_-28px_rgba(0,0,0,.85)]";

export default async function DashboardPage() {
  const user = await requireUser();

  const userSnapshot = await adminDb.collection("users").doc(user.uid).get();
  const userData = userSnapshot.data();
  if (!userSnapshot.exists || userData?.onboardingStatus === "pending") {
    redirect("/onboarding");
  }

  const credits = await getCreditStatus(user.uid);

  const sessionsQuery = await adminDb
    .collection("interviewSessions")
    .where("uid", "==", user.uid)
    .get();
  const sessions = sessionsQuery.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as SessionDoc)
    .sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));
  const completedSessions = sessions.filter((s) => s.status === "completed");
  const avgScore = completedSessions.length
    ? Math.round(
        completedSessions.reduce((sum, s) => sum + (s.overallScore ?? 0), 0) /
          completedSessions.length,
      )
    : 0;

  const canInterview = hasCreditsRemaining(credits);

  const kpis = [
    {
      label: "Turns remaining",
      value: credits.remaining,
      display: credits.unlimited ? "∞" : null,
      icon: ICONS.bolt,
      accent: KPI_ACCENTS.gold,
      suffix: "",
    },
    { label: "Interviews", value: sessions.length, display: null, icon: ICONS.mic, accent: KPI_ACCENTS.violet, suffix: "" },
    {
      label: "Completed",
      value: completedSessions.length,
      display: null,
      icon: ICONS.check,
      accent: KPI_ACCENTS.green,
      suffix: "",
    },
    { label: "Avg score", value: avgScore, display: null, icon: ICONS.star, accent: KPI_ACCENTS.coral, suffix: "/10" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      <Sidebar
        active="dashboard"
        userLabel={userData?.displayName || "You"}
        userPlan={credits.unlimited ? "Unlimited plan" : canInterview ? "Free plan" : "Free plan (exhausted)"}
      />
      <div className="relative flex-1 overflow-hidden px-4 py-9 sm:px-8">
        <div
          className="pointer-events-none absolute -top-32 left-1/2 h-[380px] w-[760px] -translate-x-1/2"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(240,180,41,.07) 0%, transparent 70%)" }}
        />

        <div className="relative mb-8 flex items-center gap-4">
          <Orb size={48} />
          <div>
            <h1 className="font-serif text-[34px] font-normal leading-tight tracking-tight text-white">
              Welcome back{userData?.displayName ? `, ${userData.displayName}` : ""}
            </h1>
            <p className="text-sm text-sub">
              {credits.unlimited
                ? "You have unlimited interview turns right now."
                : canInterview
                  ? `You have ${credits.remaining} free interview turns left.`
                  : "You've used all your free interview turns."}
            </p>
          </div>
        </div>

        <div className="relative mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpis.map((kpi, i) => (
            <Reveal key={kpi.label} delay={i * 60}>
              <div
                className={`rounded-[18px] border border-line2 bg-surface-elevated p-5 transition-all duration-300 hover:-translate-y-1 hover:border-gold/25 ${CARD_SHADOW}`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[11px] uppercase tracking-[.06em] text-muted">
                    {kpi.label}
                  </p>
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${kpi.accent}`}>
                    {kpi.icon}
                  </span>
                </div>
                <p className="mt-2.5 flex items-baseline gap-1 font-serif text-4xl font-normal tracking-tight text-white">
                  {kpi.display ?? <Counter value={kpi.value} />}
                  {kpi.suffix && <span className="font-sans text-base font-normal text-muted">{kpi.suffix}</span>}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <div
            className={`relative mb-6 overflow-hidden rounded-[20px] border border-gold/20 bg-gold-faint p-7 ${CARD_SHADOW}`}
          >
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(240,180,41,.18) 0%, transparent 70%)" }}
            />
            <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-lg font-semibold text-white">Ready for a new mock interview?</p>
                <p className="text-sm text-sub">Upload a resume and job description to get started.</p>
              </div>
              {canInterview ? (
                <LinkButton href="/dashboard/new" variant="gold" size="lg">
                  Start New Interview →
                </LinkButton>
              ) : (
                <LinkButton href="/paywall" variant="outline-gold" size="lg">
                  Upgrade to continue
                </LinkButton>
              )}
            </div>
          </div>
        </Reveal>

        <Reveal delay={180}>
          <div className={`relative rounded-[18px] border border-line2 bg-surface-elevated p-[22px] ${CARD_SHADOW}`}>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-foreground">Recent interviews</h3>
              <Link href="/history" className="text-[13px] text-gold hover:underline">
                View all
              </Link>
            </div>
            {sessions.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-9 text-center">
                <Orb size={44} />
                <div>
                  <p className="text-sm text-sub">No interviews yet.</p>
                  <p className="text-sm text-sub">Upload a resume to start your first one.</p>
                </div>
                {canInterview && (
                  <LinkButton href="/dashboard/new" variant="dark" size="sm">
                    Start your first interview
                  </LinkButton>
                )}
              </div>
            ) : (
              <div className="divide-y divide-line">
                {sessions.slice(0, 5).map((s) => (
                  <Link
                    key={s.id}
                    href={s.status === "completed" ? `/interview/${s.id}/summary` : `/interview/${s.id}`}
                    className="group flex items-center gap-4 rounded-[14px] px-2 py-3.5 transition-colors hover:bg-white/[.03]"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line2 bg-surface text-sub transition-colors group-hover:border-gold/30 group-hover:text-gold">
                      {ICONS.mic}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {s.createdAt?.toDate().toLocaleDateString() ?? "Recent session"}
                      </p>
                      <p className="text-xs text-muted">
                        {s.turnCount}/{s.maxTurns} turns
                      </p>
                    </div>
                    <Tag tone={s.status === "completed" ? "green" : "gold"}>
                      {s.status === "completed" ? "Completed" : "In progress"}
                    </Tag>
                    <span className="w-12 shrink-0 text-right font-mono text-sm font-semibold text-gold">
                      {s.overallScore != null ? (
                        <>
                          {s.overallScore}
                          <span className="text-muted">/10</span>
                        </>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </div>
  );
}
