"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Meter } from "@/components/ui/Meter";
import { Orb } from "@/components/ui/Orb";
import { WizardSteps } from "@/components/ui/StepIndicator";
import { Tag } from "@/components/ui/Tag";
import { ResumeUploader, type UploaderValue } from "@/components/ResumeUploader";
import {
  DIFFICULTY_OPTIONS,
  EXPERIENCE_BUCKETS,
  INTERVIEW_FOCUS_OPTIONS,
  type Difficulty,
  type ExperienceBucket,
  type InterviewFocus,
} from "@/lib/interviewOptions";

type LastResume = {
  id: string;
  yearsOfExperience: number;
  interviewFocus: InterviewFocus;
  preview: string;
};

type Insights = {
  highlights: string[];
  matchedSkills: string[];
  missingSkills: string[];
};

type Props = {
  profileDefaults: {
    experienceBucket: ExperienceBucket;
    interviewFocus: InterviewFocus;
    difficulty: Difficulty;
    targetCompany: string;
  };
  lastResume: LastResume | null;
};

const ACCEPT = ".pdf,.docx";
const WIZARD_STEPS = [
  { n: 1, label: "Resume" },
  { n: 2, label: "Role" },
  { n: 3, label: "Practice" },
  { n: 4, label: "Ready" },
];
const STEP_HEADLINES = [
  "Let's hear your story",
  "What role are you chasing?",
  "Here's how you stack up",
  "Almost showtime",
];
const STEP_SUBTITLES = [
  "Add your resume so your coach can tailor every question to your real experience.",
  "Paste the job description you're preparing for — we'll tailor the interview to it.",
  "A quick read on your resume against the role before we begin.",
  "Set the tone, then step into the room.",
];

function uploaderReadiness(value: UploaderValue): number {
  if (!value) return 0;
  if (value.kind === "file") return 100;
  return Math.min(100, Math.round((value.text.trim().length / 300) * 100));
}

export function InterviewWizard({ profileDefaults, lastResume }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [reuseLastResume, setReuseLastResume] = useState(false);
  const [resumeInput, setResumeInput] = useState<UploaderValue>(null);
  const [jdInput, setJdInput] = useState<UploaderValue>(null);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [experienceBucket, setExperienceBucket] = useState<ExperienceBucket>(
    profileDefaults.experienceBucket,
  );
  const [interviewFocus, setInterviewFocus] = useState<InterviewFocus>(profileDefaults.interviewFocus);
  const [difficulty, setDifficulty] = useState<Difficulty>(profileDefaults.difficulty);
  const [targetCompany, setTargetCompany] = useState(profileDefaults.targetCompany);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleUploadContinue() {
    setError(null);
    if (!jdInput) {
      setError("Add a job description for this session.");
      return;
    }
    const formData = new FormData();
    if (reuseLastResume && lastResume) {
      formData.append("reuseLastResumeId", lastResume.id);
    } else if (resumeInput?.kind === "file") {
      formData.append("resumeFile", resumeInput.file);
    } else if (resumeInput?.kind === "text") {
      formData.append("resumeText", resumeInput.text);
    }
    if (jdInput.kind === "file") {
      formData.append("jobDescriptionFile", jdInput.file);
    } else {
      formData.append("jobDescriptionText", jdInput.text);
    }
    formData.append("experienceBucket", profileDefaults.experienceBucket);
    formData.append("interviewFocus", profileDefaults.interviewFocus);
    formData.append("difficulty", profileDefaults.difficulty);
    formData.append("targetCompany", profileDefaults.targetCompany);

    setPending(true);
    try {
      const response = await fetch("/api/upload-resume", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Something went wrong.");
      setResumeId(data.resumeId);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  const insightsLoading = step === 3 && Boolean(resumeId) && !insights && !error;

  useEffect(() => {
    if (step !== 3 || !resumeId || insights) return;
    fetch(`/api/resumes/${resumeId}/insights`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? "Could not load insights.");
        setInsights(data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Something went wrong."));
  }, [step, resumeId, insights, error]);

  async function handleStartInterview() {
    if (!resumeId) return;
    setError(null);
    setPending(true);
    try {
      const response = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId, experienceBucket, interviewFocus, difficulty, targetCompany }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 402) {
          router.push("/paywall");
          return;
        }
        throw new Error(data?.error ?? "Something went wrong.");
      }
      router.push(`/interview/${data.sessionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setPending(false);
    }
  }

  const resumeReadiness = reuseLastResume ? 100 : uploaderReadiness(resumeInput);
  const jdReadiness = uploaderReadiness(jdInput);

  return (
    <div className="w-full max-w-xl space-y-8">
      <WizardSteps steps={WIZARD_STEPS} current={step} />

      <div key={step} className="animate-fade-in flex flex-col items-center gap-4 text-center">
        <Orb size={72} withRings />
        <div>
          <h2 className="font-serif text-[32px] font-normal tracking-tight text-white">
            {STEP_HEADLINES[step - 1]}
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-sub">
            {STEP_SUBTITLES[step - 1]}
          </p>
        </div>
      </div>

      {step === 1 && (
        <>
          <Card className="animate-fade-in space-y-4">
            {lastResume && (
              <button
                type="button"
                onClick={() => setReuseLastResume((v) => !v)}
                className={`flex w-full items-start gap-3.5 rounded-[16px] border px-4 py-3.5 text-left transition-all duration-200 ${
                  reuseLastResume
                    ? "border-gold bg-gold-faint"
                    : "border-line2 bg-surface-elevated hover:border-line hover:bg-line/40"
                }`}
              >
                <span
                  className={`relative mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-[1.5px] transition ${
                    reuseLastResume ? "border-gold" : "border-line2"
                  }`}
                >
                  {reuseLastResume && <span className="h-2 w-2 rounded-full bg-gold" />}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-foreground">
                    Reuse last resume
                  </span>
                  <span className="block truncate text-xs text-muted">
                    {lastResume.preview.slice(0, 70)}…
                  </span>
                </span>
              </button>
            )}
            {!reuseLastResume && (
              <ResumeUploader
                label="Resume"
                accept={ACCEPT}
                textPlaceholder="Paste your resume text..."
                onChange={setResumeInput}
              />
            )}
            <Meter label="Resume readiness" percent={resumeReadiness} />
            <Button
              variant="gold"
              size="lg"
              fullWidth
              disabled={!reuseLastResume && !resumeInput}
              onClick={() => setStep(2)}
            >
              Continue
            </Button>
          </Card>
          <p className="mx-auto max-w-sm text-center text-xs leading-relaxed text-muted">
            Your resume is only used to personalize your mock interview questions — it&apos;s
            never shared with recruiters.
          </p>
        </>
      )}

      {step === 2 && (
        <>
          <Card className="animate-fade-in space-y-4">
            <ResumeUploader
              label="Job description"
              accept={ACCEPT}
              textPlaceholder="Paste the job description..."
              onChange={setJdInput}
            />
            <Meter label="Role details readiness" percent={jdReadiness} />
            {error && <p className="text-sm text-coral">{error}</p>}
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                variant="gold"
                size="lg"
                fullWidth
                disabled={!jdInput || pending}
                onClick={handleUploadContinue}
              >
                {pending ? "Uploading…" : "Continue"}
              </Button>
            </div>
          </Card>
          <p className="mx-auto max-w-sm text-center text-xs leading-relaxed text-muted">
            We only use the job description to tailor question difficulty and focus areas.
          </p>
        </>
      )}

      {step === 3 && (
        <Card className="animate-fade-in space-y-5">
          {insightsLoading && (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <Orb size={64} className="animate-breathe" />
              <p className="font-mono text-[11px] uppercase tracking-[.12em] text-sub">
                Analyzing your resume against the job description&hellip;
              </p>
            </div>
          )}
          {error && <p className="text-sm text-coral">{error}</p>}
          {insights && (
            <div className="space-y-5">
              <div>
                <p className="mb-2 font-mono text-[11px] uppercase tracking-[.1em] text-gold">
                  Highlights
                </p>
                <ul className="space-y-1.5 text-sm text-body">
                  {insights.highlights.map((h) => (
                    <li key={h} className="flex gap-2">
                      <span className="text-gold">→</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-2 font-mono text-[11px] uppercase tracking-[.1em] text-green">
                  Matched skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {insights.matchedSkills.map((s) => (
                    <Tag key={s} tone="green">
                      {s}
                    </Tag>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 font-mono text-[11px] uppercase tracking-[.1em] text-coral">
                  Gaps to address
                </p>
                <div className="flex flex-wrap gap-2">
                  {insights.missingSkills.map((s) => (
                    <Tag key={s} tone="coral">
                      {s}
                    </Tag>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button variant="gold" size="lg" fullWidth disabled={!insights} onClick={() => setStep(4)}>
              Continue
            </Button>
          </div>
        </Card>
      )}

      {step === 4 && (
        <Card className="animate-fade-in space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="targetCompany" className="text-sm font-medium text-sub">
              Target company <span className="text-muted">(optional)</span>
            </label>
            <input
              id="targetCompany"
              value={targetCompany}
              onChange={(event) => setTargetCompany(event.target.value)}
              placeholder="e.g. Google"
              className="w-full rounded-full border border-line2 bg-surface-elevated px-4 py-2.5 text-sm transition-colors focus:border-gold focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-sm font-medium text-sub">Years of experience</span>
            <div className="grid grid-cols-3 gap-2">
              {EXPERIENCE_BUCKETS.map((bucket) => (
                <button
                  key={bucket.value}
                  type="button"
                  onClick={() => setExperienceBucket(bucket.value)}
                  className={`rounded-full border px-3 py-2.5 text-center text-sm transition-all duration-200 ${
                    experienceBucket === bucket.value
                      ? "border-gold bg-gold-faint text-gold"
                      : "border-line2 bg-surface-elevated text-sub hover:border-line hover:text-foreground"
                  }`}
                >
                  {bucket.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-sm font-medium text-sub">Interview type</span>
            <div className="grid grid-cols-3 gap-2">
              {INTERVIEW_FOCUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setInterviewFocus(opt.value)}
                  className={`rounded-full border px-3 py-2.5 text-center text-sm transition-all duration-200 ${
                    interviewFocus === opt.value
                      ? "border-gold bg-gold-faint text-gold"
                      : "border-line2 bg-surface-elevated text-sub hover:border-line hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-sm font-medium text-sub">Difficulty</span>
            <div className="grid grid-cols-4 gap-2">
              {DIFFICULTY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDifficulty(opt.value)}
                  className={`rounded-full border px-2 py-2.5 text-center text-xs transition-all duration-200 ${
                    difficulty === opt.value
                      ? "border-gold bg-gold-faint text-gold"
                      : "border-line2 bg-surface-elevated text-sub hover:border-line hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-coral">{error}</p>}
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setStep(3)}>
              Back
            </Button>
            <Button variant="gold" size="lg" fullWidth disabled={pending} onClick={handleStartInterview}>
              {pending ? "Starting…" : "Start Interview"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
