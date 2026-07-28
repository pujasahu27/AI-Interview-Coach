"use client";

import { useEffect, useState } from "react";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Orb } from "@/components/ui/Orb";
import { Tag } from "@/components/ui/Tag";

type RecommendationsSummary = {
  overallScore: number;
  strengths: string[];
  gapsToImprove: string[];
  recommendations: string[];
};

type TimelineEntry = { question: string; score: number };

export function FinalReport({ sessionId }: { sessionId: string }) {
  const [summary, setSummary] = useState<RecommendationsSummary | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/interview/${sessionId}/end`, { method: "POST" })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? "Something went wrong.");
        setSummary(data.recommendationsSummary);
        setTimeline(data.timeline ?? []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Something went wrong."));
  }, [sessionId]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center gap-7 px-6 py-16">
      <Orb size={56} />
      <h1 className="font-serif text-3xl font-normal tracking-tight text-white">Final Report</h1>

      {error && (
        <div className="flex flex-col items-center gap-5 text-center">
          <p className="text-sm text-coral">{error}</p>
          <LinkButton href="/dashboard" variant="dark">
            Back to Dashboard
          </LinkButton>
        </div>
      )}

      {!summary && !error && (
        <p className="text-sub">Generating your personalized recommendations…</p>
      )}

      {summary && (
        <div className="w-full space-y-4">
          <Card className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
            <div className="flex items-end gap-1 font-serif text-7xl font-normal leading-none tracking-tight text-white">
              {summary.overallScore}
              <sub className="mb-1 font-sans text-xl font-normal text-muted">/10</sub>
            </div>
            <div className="flex flex-wrap gap-2">
              <Tag tone="gold">Overall</Tag>
              {summary.gapsToImprove.length > 0 && <Tag tone="coral">Gaps found</Tag>}
              {summary.strengths.length > 0 && <Tag tone="green">Strengths noted</Tag>}
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <h3 className="mb-4 text-[15px] font-semibold text-foreground">Question timeline</h3>
              <div className="space-y-4 border-l border-line2 pl-5">
                {timeline.map((t, i) => (
                  <div key={i} className="relative">
                    <span className="absolute -left-[26px] top-1.5 h-2 w-2 rounded-full border-2 border-surface bg-gold" />
                    <p className="font-mono text-[11.5px] text-muted">Q{i + 1}</p>
                    <p className="text-sm text-foreground">
                      {t.question.slice(0, 70)}
                      {t.question.length > 70 ? "…" : ""} — {t.score}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="mb-4 text-[15px] font-semibold text-foreground">Learning roadmap</h3>
              <div className="space-y-2">
                {summary.recommendations.map((r, i) => (
                  <div key={r} className="flex gap-3 rounded-lg border border-line2 bg-surface-elevated p-3">
                    <span className="shrink-0 font-mono text-xs text-gold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="text-sm text-foreground">{r}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-[.1em] text-green">
                Strengths
              </p>
              <ul className="space-y-1.5 text-sm text-body">
                {summary.strengths.map((s) => (
                  <li key={s} className="flex gap-2">
                    <span className="font-bold text-green">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-[.1em] text-coral">
                Gaps to improve
              </p>
              <ul className="space-y-1.5 text-sm text-body">
                {summary.gapsToImprove.map((g) => (
                  <li key={g} className="flex gap-2">
                    <span className="font-bold text-coral">×</span>
                    {g}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="flex gap-3">
            <LinkButton href="/history" variant="dark" fullWidth>
              View History
            </LinkButton>
            <LinkButton href="/dashboard/new" variant="gold" fullWidth>
              New Interview
            </LinkButton>
          </div>
        </div>
      )}
    </div>
  );
}
