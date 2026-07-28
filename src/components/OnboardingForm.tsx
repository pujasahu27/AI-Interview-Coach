"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Orb } from "@/components/ui/Orb";
import { WizardSteps } from "@/components/ui/StepIndicator";
import {
  COMPANY_EXAMPLES,
  DIFFICULTY_OPTIONS,
  EXPERIENCE_BUCKETS,
  INTERVIEW_FOCUS_OPTIONS,
  ROLE_EXAMPLES,
  type Difficulty,
  type ExperienceBucket,
  type InterviewFocus,
} from "@/lib/interviewOptions";

const WIZARD_STEPS = [
  { n: 1, label: "Role" },
  { n: 2, label: "Experience" },
  { n: 3, label: "Company" },
  { n: 4, label: "Type" },
  { n: 5, label: "Level" },
];

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
      className={`rounded-full border px-4 py-3 text-sm transition-all duration-200 ${
        active
          ? "border-gold bg-gold-faint text-gold"
          : "border-line2 bg-surface-elevated text-sub hover:border-line hover:text-foreground"
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
  const [targetCompany, setTargetCompany] = useState("");
  const [experienceBucket, setExperienceBucket] = useState<ExperienceBucket>("1-3");
  const [interviewFocus, setInterviewFocus] = useState<InterviewFocus>("mixed");
  const [difficulty, setDifficulty] = useState<Difficulty>("intermediate");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<"complete" | "skip" | null>(null);
  const companyInputRef = useRef<HTMLInputElement>(null);

  async function submit(action: "complete" | "skip") {
    setError(null);
    setPending(action);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          action === "skip"
            ? { action: "skip" }
            : {
                action: "complete",
                displayName,
                targetRole,
                targetCompany,
                defaultExperienceBucket: experienceBucket,
                defaultInterviewFocus: interviewFocus,
                defaultDifficulty: difficulty,
              },
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
      {step > 1 && <WizardSteps steps={WIZARD_STEPS} current={step - 1} />}

      {step === 1 && (
        <div className="animate-fade-in flex flex-col items-center gap-7 text-center">
          <Orb size={72} withRings />
          <div>
            <h1 className="font-serif text-[32px] font-normal tracking-tight text-white">
              Let&apos;s personalize your interview
            </h1>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-sub">
              Answer a few quick questions so I can tailor your mock interview.
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
          <Button
            variant="gold"
            size="lg"
            fullWidth
            disabled={!targetRole.trim()}
            onClick={() => setStep(3)}
          >
            Continue
          </Button>
        </Card>
      )}

      {step === 3 && (
        <Card className="animate-fade-in space-y-5">
          <h2 className="text-center font-serif text-2xl font-normal text-white">
            How many years of professional experience do you have?
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            {EXPERIENCE_BUCKETS.map((bucket) => (
              <OptionButton
                key={bucket.value}
                label={bucket.label}
                active={experienceBucket === bucket.value}
                onClick={() => setExperienceBucket(bucket.value)}
              />
            ))}
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button variant="gold" fullWidth onClick={() => setStep(4)}>
              Continue
            </Button>
          </div>
        </Card>
      )}

      {step === 4 && (
        <Card className="animate-fade-in space-y-5">
          <h2 className="text-center font-serif text-2xl font-normal text-white">
            Which company are you interviewing for?
          </h2>
          <input
            ref={companyInputRef}
            value={targetCompany}
            onChange={(event) => setTargetCompany(event.target.value)}
            placeholder="e.g. Google, or your own"
            className="w-full rounded-full border border-line2 bg-surface-elevated px-4 py-3 text-sm transition-colors focus:border-gold focus:outline-none"
          />
          <div className="flex flex-wrap gap-2">
            {COMPANY_EXAMPLES.map((company) => (
              <ChipButton
                key={company}
                label={company}
                active={targetCompany === company}
                onClick={() => setTargetCompany(company)}
              />
            ))}
            <ChipButton
              label="Other"
              active={false}
              onClick={() => {
                setTargetCompany("");
                companyInputRef.current?.focus();
              }}
            />
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setStep(3)}>
              Back
            </Button>
            <Button variant="gold" fullWidth onClick={() => setStep(5)}>
              Continue
            </Button>
          </div>
        </Card>
      )}

      {step === 5 && (
        <Card className="animate-fade-in space-y-5">
          <h2 className="text-center font-serif text-2xl font-normal text-white">
            What type of interview do you want to practice?
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            {INTERVIEW_FOCUS_OPTIONS.map((opt) => (
              <OptionButton
                key={opt.value}
                label={opt.label}
                active={interviewFocus === opt.value}
                onClick={() => setInterviewFocus(opt.value)}
              />
            ))}
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setStep(4)}>
              Back
            </Button>
            <Button variant="gold" fullWidth onClick={() => setStep(6)}>
              Continue
            </Button>
          </div>
        </Card>
      )}

      {step === 6 && (
        <Card className="animate-fade-in space-y-5">
          <h2 className="text-center font-serif text-2xl font-normal text-white">
            Select the interview difficulty
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            {DIFFICULTY_OPTIONS.map((opt) => (
              <OptionButton
                key={opt.value}
                label={opt.label}
                active={difficulty === opt.value}
                onClick={() => setDifficulty(opt.value)}
              />
            ))}
          </div>
          {error && <p className="text-sm text-coral">{error}</p>}
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setStep(5)}>
              Back
            </Button>
            <Button
              variant="gold"
              fullWidth
              disabled={pending !== null}
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
