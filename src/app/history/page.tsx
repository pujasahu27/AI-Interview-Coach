import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";
import { Sidebar } from "@/components/ui/Sidebar";
import { Tag } from "@/components/ui/Tag";
import { adminDb } from "@/lib/firebase-admin";
import { getCreditStatus, hasCreditsRemaining } from "@/lib/credits";
import { requireUser } from "@/lib/session";

type SessionDoc = {
  id: string;
  status: string;
  turnCount: number;
  maxTurns: number;
  overallScore: number | null;
  createdAt?: { toDate(): Date };
};

const MIC_ICON = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
  </svg>
);

export default async function HistoryPage() {
  const user = await requireUser();
  const userSnap = await adminDb.collection("users").doc(user.uid).get();
  const credits = await getCreditStatus(user.uid);

  const sessionsSnap = await adminDb
    .collection("interviewSessions")
    .where("uid", "==", user.uid)
    .get();

  const sessions = sessionsSnap.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as SessionDoc)
    .sort(
      (a, b) => (b.createdAt?.toDate().getTime() ?? 0) - (a.createdAt?.toDate().getTime() ?? 0),
    );

  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      <Sidebar
        active="history"
        userLabel={userSnap.data()?.displayName || "You"}
        userPlan={
          credits.unlimited
            ? "Unlimited plan"
            : hasCreditsRemaining(credits)
              ? "Free plan"
              : "Free plan (exhausted)"
        }
      />
      <div className="flex-1 px-4 py-9 sm:px-8">
        <h1 className="mb-1 font-serif text-[28px] font-normal tracking-tight text-white">
          Interview history
        </h1>
        <p className="mb-7 text-sm text-sub">Every session, scored and searchable.</p>

        {sessions.length === 0 ? (
          <div className="rounded-xl border border-line2 bg-surface p-8 text-center">
            <p className="mb-4 text-sub">You haven&apos;t started any interviews yet.</p>
            <LinkButton href="/dashboard/new" variant="gold">
              Start your first interview
            </LinkButton>
          </div>
        ) : (
          <>
            {/* Card rows on narrow screens — a 5-column table doesn't fit a phone. */}
            <div className="divide-y divide-line rounded-xl border border-line2 bg-surface sm:hidden">
              {sessions.map((s) => (
                <Link
                  key={s.id}
                  href={s.status === "completed" ? `/interview/${s.id}/summary` : `/interview/${s.id}`}
                  className="group flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-surface-elevated"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line2 bg-surface-elevated text-sub transition-colors group-hover:border-gold/30 group-hover:text-gold">
                    {MIC_ICON}
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
                  <span className="w-10 shrink-0 text-right font-mono text-sm font-semibold text-gold">
                    {s.overallScore != null ? s.overallScore : <span className="text-muted">—</span>}
                  </span>
                </Link>
              ))}
            </div>

            {/* Full table from sm up. */}
            <div className="hidden overflow-x-auto rounded-xl border border-line2 bg-surface sm:block">
              <table className="w-full min-w-[540px] border-collapse">
                <thead>
                  <tr>
                    {["Session", "Turns", "Status", "Date", "Score"].map((h) => (
                      <th
                        key={h}
                        className="px-4 pb-3 pt-4 text-left font-mono text-[11.5px] uppercase tracking-[.06em] text-muted"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s.id} className="group border-t border-line hover:bg-surface-elevated">
                      <td className="px-4 py-3.5 text-sm text-sub">
                        <Link
                          href={s.status === "completed" ? `/interview/${s.id}/summary` : `/interview/${s.id}`}
                          className="block text-foreground group-hover:text-white"
                        >
                          Mock interview
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-sub">
                        {s.turnCount}/{s.maxTurns}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-sub">
                        {s.status === "completed" ? "Completed" : "In progress"}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-sub">
                        {s.createdAt?.toDate().toLocaleDateString() ?? "—"}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-sm font-medium text-gold">
                        {s.overallScore ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
