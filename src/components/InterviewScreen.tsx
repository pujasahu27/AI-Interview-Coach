"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { QuestionPlayer } from "@/components/QuestionPlayer";
import { Button } from "@/components/ui/Button";
import { Orb } from "@/components/ui/Orb";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { VoiceRecorder } from "@/components/VoiceRecorder";

type Props = {
  sessionId: string;
  initialQuestion: string;
  initialTurnNumber: number;
  maxTurns: number;
};

type Phase = "question" | "thinking" | "wrapping";

const THINKING_LINES = [
  "Considering your answer…",
  "Following up on that…",
  "Noting that down…",
];

const TURN_SECONDS = 60;

function formatSeconds(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function InterviewHeader({
  turnNumber,
  maxTurns,
  onEnd,
}: {
  turnNumber: number;
  maxTurns: number;
  onEnd: () => void;
}) {
  return (
    <header className="relative z-10 mx-auto flex w-full max-w-xl items-center gap-4 px-6 pt-8">
      <StepIndicator total={maxTurns} current={turnNumber} />
      <button
        type="button"
        onClick={onEnd}
        className="shrink-0 font-mono text-[11px] uppercase tracking-[.08em] text-muted transition hover:text-coral"
      >
        End
      </button>
    </header>
  );
}

function QuestionTimer({
  turnNumber,
  maxTurns,
  paused,
  onExpire,
}: {
  turnNumber: number;
  maxTurns: number;
  paused: boolean;
  onExpire: () => void;
}) {
  const [secondsLeft, setSecondsLeft] = useState(TURN_SECONDS);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [paused]);

  useEffect(() => {
    if (!paused && secondsLeft === 0) onExpire();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, paused]);

  const urgent = secondsLeft <= 10;

  return (
    <>
      <div className="relative z-10 mx-auto mt-2.5 flex w-full max-w-xl items-center justify-center gap-2.5 px-6">
        <p className="font-mono text-[11px] uppercase tracking-[.1em] text-sub">
          Question {Math.min(turnNumber, maxTurns)} of {maxTurns}
        </p>
        <span
          className={`font-mono text-[11px] tabular-nums ${urgent ? "text-coral" : "text-muted"}`}
        >
          &middot; {paused ? "listening…" : formatSeconds(secondsLeft)}
        </span>
      </div>
      <div className="relative z-10 mx-auto mt-2 w-full max-w-xl px-6">
        <div className="h-[3px] w-full overflow-hidden rounded-full bg-line2">
          <div
            className={`h-full rounded-full transition-[width] duration-1000 ease-linear ${
              urgent ? "bg-coral" : "bg-gold"
            }`}
            style={{ width: paused ? "100%" : `${(secondsLeft / TURN_SECONDS) * 100}%` }}
          />
        </div>
      </div>
    </>
  );
}

function QuestionStage({
  question,
  turnNumber,
  maxTurns,
  answer,
  onAnswerChange,
  error,
  onSubmit,
  onExpire,
  onEnd,
}: {
  question: string;
  turnNumber: number;
  maxTurns: number;
  answer: string;
  onAnswerChange: (value: string) => void;
  error: string | null;
  onSubmit: () => void;
  onExpire: () => void;
  onEnd: () => void;
}) {
  const [narrating, setNarrating] = useState(true);

  return (
    <>
      <div className="sticky top-0 z-30 bg-background/90 pb-2 backdrop-blur-sm">
        <InterviewHeader turnNumber={turnNumber} maxTurns={maxTurns} onEnd={onEnd} />
        <QuestionTimer
          turnNumber={turnNumber}
          maxTurns={maxTurns}
          paused={narrating}
          onExpire={onExpire}
        />
      </div>
      <div className="relative z-10 mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-12 px-6 py-14">
        <div className="animate-fade-in flex flex-col gap-10">
          <QuestionPlayer text={question} onSpeechEnd={() => setNarrating(false)} />

          <div className="flex flex-col gap-3">
            <p className="text-center font-mono text-[10.5px] uppercase tracking-[.16em] text-muted">
              You
            </p>
            <VoiceRecorder value={answer} onChange={onAnswerChange} disabled={false} />
          </div>

          {error && <p className="text-center text-sm text-coral">{error}</p>}
          <Button variant="gold" size="lg" fullWidth onClick={onSubmit}>
            Submit Answer
          </Button>
        </div>
      </div>
    </>
  );
}

export function InterviewScreen({
  sessionId,
  initialQuestion,
  initialTurnNumber,
  maxTurns,
}: Props) {
  const router = useRouter();
  const [question, setQuestion] = useState(initialQuestion);
  const [turnNumber, setTurnNumber] = useState(initialTurnNumber);
  const [answer, setAnswer] = useState("");
  const [phase, setPhase] = useState<Phase>("question");
  const [thinkingLine] = useState(
    () => THINKING_LINES[Math.floor(Math.random() * THINKING_LINES.length)],
  );
  const [error, setError] = useState<string | null>(null);

  async function handleSubmitAnswer(auto = false) {
    const trimmed = answer.trim();
    if (!auto && !trimmed) {
      setError("Record or type an answer before submitting.");
      return;
    }
    const textToSubmit = trimmed || "(No answer provided — time ran out.)";
    setError(null);
    setPhase("thinking");
    const thinkingSince = Date.now();
    try {
      const response = await fetch(`/api/interview/${sessionId}/turn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answerTranscript: textToSubmit }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 402) {
          router.push("/paywall");
          return;
        }
        throw new Error(data?.error ?? "Something went wrong.");
      }

      // Keep a natural, believable pause before revealing the next beat —
      // never shorter than this even if the API responds instantly.
      const remaining = 900 - (Date.now() - thinkingSince);
      await new Promise((resolve) => setTimeout(resolve, Math.max(remaining, 0)));

      if (data.isSessionComplete) {
        setPhase("wrapping");
        setTimeout(() => router.push(`/interview/${sessionId}/summary`), 1100);
        return;
      }

      setQuestion(data.nextQuestion);
      setTurnNumber((n) => n + 1);
      setAnswer("");
      setPhase("question");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setPhase("question");
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-[440px]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(240,180,41,.09) 0%, transparent 70%)",
        }}
      />

      {phase === "question" ? (
        <QuestionStage
          key={question}
          question={question}
          turnNumber={turnNumber}
          maxTurns={maxTurns}
          answer={answer}
          onAnswerChange={setAnswer}
          error={error}
          onSubmit={() => void handleSubmitAnswer(false)}
          onExpire={() => void handleSubmitAnswer(true)}
          onEnd={() => router.push(`/interview/${sessionId}/summary`)}
        />
      ) : (
        <>
          <div className="sticky top-0 z-30 bg-background/90 pb-2 backdrop-blur-sm">
            <InterviewHeader
              turnNumber={turnNumber}
              maxTurns={maxTurns}
              onEnd={() => router.push(`/interview/${sessionId}/summary`)}
            />
            <p className="relative z-10 mx-auto mt-2.5 w-full max-w-xl px-6 text-center font-mono text-[11px] uppercase tracking-[.1em] text-sub">
              Question {Math.min(turnNumber, maxTurns)} of {maxTurns}
            </p>
          </div>
          <div className="relative z-10 mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-12 px-6 py-14">
            {phase === "thinking" && (
              <div className="animate-fade-in flex flex-col items-center gap-6 py-16 text-center">
                <Orb size={92} className="animate-breathe" />
                <p className="font-mono text-[11px] uppercase tracking-[.14em] text-sub">
                  {thinkingLine}
                </p>
              </div>
            )}

            {phase === "wrapping" && (
              <div className="animate-fade-in flex flex-col items-center gap-6 py-16 text-center">
                <Orb size={92} withRings />
                <p className="font-mono text-[11px] uppercase tracking-[.14em] text-sub">
                  That&apos;s a wrap — preparing your report…
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
