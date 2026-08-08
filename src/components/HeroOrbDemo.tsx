"use client";

import { useEffect, useRef, useState } from "react";
import { Orb } from "@/components/ui/Orb";

const GREETING = "Hi, I'm your AI interviewer. Let's get you ready for the real thing.";
const WAVE_HEIGHTS = [5, 14, 9, 18, 11, 7, 15];
const TYPE_MS = 32;

export function HeroOrbDemo() {
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState<"speaking" | "listening">("speaking");
  const typeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function playGreeting() {
    if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
    if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    setPhase("speaking");
    setTyped("");

    let i = 0;
    typeIntervalRef.current = setInterval(() => {
      i += 1;
      setTyped(GREETING.slice(0, i));
      if (i >= GREETING.length && typeIntervalRef.current) {
        clearInterval(typeIntervalRef.current);
        typeIntervalRef.current = null;
        advanceTimeoutRef.current = setTimeout(() => setPhase("listening"), 500);
      }
    }, TYPE_MS);
  }

  useEffect(() => {
    playGreeting();
    return () => {
      if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
      if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex min-h-[52px] max-w-md items-center gap-3 rounded-full border border-line2 bg-surface-elevated px-5 py-3 text-sm text-body">
        {phase === "speaking" ? (
          <span className="flex-1 text-center">
            {typed}
            <span className="animate-blink ml-0.5 inline-block h-[14px] w-[2px] translate-y-[2px] bg-gold" />
          </span>
        ) : (
          <button
            type="button"
            onClick={playGreeting}
            aria-label="Replay the greeting"
            title="Tap to replay"
            className="animate-fade-in mx-auto flex items-center gap-2.5 text-body transition-colors hover:text-gold"
          >
            <span className="flex h-[18px] items-center gap-[3px]">
              {WAVE_HEIGHTS.map((h, i) => (
                <span
                  key={i}
                  className="animate-wave-bar w-[2.5px] rounded-full bg-gold"
                  style={{ height: h, animationDelay: `${-1.05 + i * 0.15}s` }}
                />
              ))}
            </span>
            Listening&hellip;
          </button>
        )}
      </div>
      <Orb size={200} withRings />
      <p className="font-mono text-[11px] uppercase tracking-[.12em] text-muted">
        Your AI Interviewer
      </p>
    </div>
  );
}
