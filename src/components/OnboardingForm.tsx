"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Orb } from "@/components/ui/Orb";
import { ROLE_EXAMPLES } from "@/lib/interviewOptions";

function ChipButton({
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
      className={`rounded-full border px-3.5 py-1.5 text-xs transition-all duration-200 ${
        active
          ? "border-gold bg-gold-faint text-gold"
          : "border-line2 text-sub hover:border-line hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

export function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<"complete" | "skip" | null>(null);

  async function submit(action: "complete" | "skip") {
    setError(null);
    setPending(action);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          action === "skip" ? { action: "skip" } : { action: "complete", displayName, targetRole },
        ),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Something went wrong.");
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="w-full max-w-md space-y-7">
      {step === 1 && (
        <div className="animate-fade-in flex flex-col items-center gap-7 text-center">
          <Orb size={72} withRings />
          <div>
            <h1 className="font-serif text-[32px] font-normal tracking-tight text-white">
              Let&apos;s personalize your interview
            </h1>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-sub">
              Answer a couple of quick questions so I can tailor your mock interview.
            </p>
          </div>
          <div className="w-full space-y-1.5 text-left">
            <label htmlFor="displayName" className="text-sm font-medium text-sub">
              What should we call you?
            </label>
            <input
              id="displayName"
              required
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Your name"
              className="w-full rounded-full border border-line2 bg-surface-elevated px-4 py-3 text-center text-sm transition-colors focus:border-gold focus:outline-none"
            />
          </div>
          <Button
            variant="gold"
            size="lg"
            fullWidth
            disabled={!displayName.trim()}
            onClick={() => setStep(2)}
          >
            Get Started
          </Button>
        </div>
      )}

      {step === 2 && (
        <Card className="animate-fade-in space-y-5">
          <h2 className="text-center font-serif text-2xl font-normal text-white">
            What role are you preparing for?
          </h2>
          <input
            value={targetRole}
            onChange={(event) => setTargetRole(event.target.value)}
            placeholder="e.g. Backend Engineer"
            className="w-full rounded-full border border-line2 bg-surface-elevated px-4 py-3 text-sm transition-colors focus:border-gold focus:outline-none"
          />
          <div className="flex flex-wrap gap-2">
            {ROLE_EXAMPLES.map((role) => (
              <ChipButton
                key={role}
                label={role}
                active={targetRole === role}
                onClick={() => setTargetRole(role)}
              />
            ))}
          </div>
          {error && <p className="text-sm text-coral">{error}</p>}
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              variant="gold"
              fullWidth
              disabled={!targetRole.trim() || pending !== null}
              onClick={() => void submit("complete")}
            >
              {pending === "complete" ? "Saving…" : "Finish"}
            </Button>
          </div>
        </Card>
      )}

      {step > 1 && (
        <button
          type="button"
          onClick={() => void submit("skip")}
          disabled={pending !== null}
          className="mx-auto block text-xs text-muted transition hover:text-sub"
        >
          Skip for now
        </button>
      )}
    </div>
  );
}
