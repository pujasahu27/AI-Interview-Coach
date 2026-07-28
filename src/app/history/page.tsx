import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";
import { Sidebar } from "@/components/ui/Sidebar";
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
    <div className="flex min-h-screen bg-background">
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
      <div className="flex-1 px-8 py-9">
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
          <div className="overflow-hidden rounded-xl border border-line2 bg-surface">
            <table className="w-full border-collapse">
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
        )}
      </div>
    </div>
  );
}
