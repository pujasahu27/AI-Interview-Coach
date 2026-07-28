"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  DIFFICULTY_OPTIONS,
  EXPERIENCE_BUCKETS,
  INTERVIEW_FOCUS_OPTIONS,
  type Difficulty,
  type ExperienceBucket,
  type InterviewFocus,
} from "@/lib/interviewOptions";

type Props = {
  initial: {
    displayName: string;
    targetRole: string;
    targetCompany: string;
    defaultExperienceBucket: ExperienceBucket;
    defaultInterviewFocus: InterviewFocus;
    defaultDifficulty: Difficulty;
  };
};

function OptionButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-2.5 text-center text-sm transition-all duration-200 ${
        active
          ? "border-gold bg-gold-faint text-gold"
          : "border-line2 bg-surface-elevated text-sub hover:border-line hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

export function ProfileForm({ initial }: Props) {
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [targetRole, setTargetRole] = useState(initial.targetRole);
  const [targetCompany, setTargetCompany] = useState(initial.targetCompany);
  const [experienceBucket, setExperienceBucket] = useState<ExperienceBucket>(
    initial.defaultExperienceBucket,
  );
  const [interviewFocus, setInterviewFocus] = useState<InterviewFocus>(
    initial.defaultInterviewFocus,
  );
  const [difficulty, setDifficulty] = useState<Difficulty>(initial.defaultDifficulty);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    setPending(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "complete",
          displayName,
          targetRole,
          targetCompany,
          defaultExperienceBucket: experienceBucket,
          defaultInterviewFocus: interviewFocus,
          defaultDifficulty: difficulty,
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Something went wrong.");
      }
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="displayName" className="text-sm font-medium text-sub">
            Full name
          </label>
          <input
            id="displayName"
            required
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            className="w-full rounded-lg border border-line2 bg-surface-elevated px-3.5 py-2.5 text-sm transition-colors focus:border-gold focus:outline-none"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="targetRole" className="text-sm font-medium text-sub">
            Target role / job title
          </label>
          <input
            id="targetRole"
            required
            value={targetRole}
            onChange={(event) => setTargetRole(event.target.value)}
            className="w-full rounded-lg border border-line2 bg-surface-elevated px-3.5 py-2.5 text-sm transition-colors focus:border-gold focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="targetCompany" className="text-sm font-medium text-sub">
          Target company
        </label>
        <input
          id="targetCompany"
          placeholder="e.g. Google, or leave blank"
          value={targetCompany}
          onChange={(event) => setTargetCompany(event.target.value)}
          className="w-full rounded-lg border border-line2 bg-surface-elevated px-3.5 py-2.5 text-sm transition-colors focus:border-gold focus:outline-none"
        />
      </div>

      <div className="space-y-2">
        <span className="text-sm font-medium text-sub">Default years of experience</span>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {EXPERIENCE_BUCKETS.map((bucket) => (
            <OptionButton
              key={bucket.value}
              label={bucket.label}
              active={experienceBucket === bucket.value}
              onClick={() => setExperienceBucket(bucket.value)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-sm font-medium text-sub">Default interview type</span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {INTERVIEW_FOCUS_OPTIONS.map((opt) => (
            <OptionButton
              key={opt.value}
              label={opt.label}
              active={interviewFocus === opt.value}
              onClick={() => setInterviewFocus(opt.value)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-sm font-medium text-sub">Default difficulty</span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {DIFFICULTY_OPTIONS.map((opt) => (
            <OptionButton
              key={opt.value}
              label={opt.label}
              active={difficulty === opt.value}
              onClick={() => setDifficulty(opt.value)}
            />
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-coral">{error}</p>}
      {saved && <p className="text-sm text-green">Saved.</p>}
      <Button type="submit" variant="gold" disabled={pending}>
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
