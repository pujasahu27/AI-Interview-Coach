"use client";

import { useEffect, useRef, useState } from "react";
import { Orb } from "@/components/ui/Orb";
import { speakText } from "@/lib/speech";

const GREETING = "Hi, I'm your AI interviewer. Let's get you ready for the real thing.";
const WAVE_HEIGHTS = [5, 14, 9, 18, 11, 7, 15];
const REPLAY_WAVE_HEIGHTS = [6, 10, 7];
const TYPE_MS = 32;
// If the browser blocks autoplay (no onstart/onend ever fires), don't leave
// the UI stuck on "speaking" forever — move on after a generous delay.
const AUTOPLAY_FALLBACK_MS = 6000;

export function HeroOrbDemo() {
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState<"speaking" | "listening">("speaking");
  const [supported, setSupported] = useState(false);
  const [voicePlaying, setVoicePlaying] = useState(false);
  const advancedRef = useRef(false);
  const typeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function advanceToListening() {
    if (advancedRef.current) return;
    advancedRef.current = true;
    setPhase("listening");
  }

  function speak(isInitial: boolean) {
    void speakText(GREETING, {
      onStart: () => setVoicePlaying(true),
      onEnd: () => {
        setVoicePlaying(false);
        if (isInitial) setTimeout(advanceToListening, 500);
      },
      onError: () => {
        setVoicePlaying(false);
        if (isInitial) advanceToListening();
      },
    });
  }

  function playGreeting() {
    if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
    if (fallbackRef.current) clearTimeout(fallbackRef.current);
    advancedRef.current = false;
    setPhase("speaking");
    setTyped("");

    let i = 0;
    typeIntervalRef.current = setInterval(() => {
      i += 1;
      setTyped(GREETING.slice(0, i));
      if (i >= GREETING.length && typeIntervalRef.current) {
        clearInterval(typeIntervalRef.current);
        typeIntervalRef.current = null;
      }
    }, TYPE_MS);

    // Best-effort autoplay — some browsers block audio before any user
    // interaction on the page, hence the manual replay controls.
    speak(true);
    fallbackRef.current = setTimeout(advanceToListening, AUTOPLAY_FALLBACK_MS);
  }

  useEffect(() => {
    // window.speechSynthesis only exists client-side; syncing it into state
    // here (instead of a lazy useState initializer) keeps the first client
    // render matching the server-rendered HTML and avoids a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(Boolean(window.speechSynthesis));

    playGreeting();

    return () => {
      if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
      if (fallbackRef.current) clearTimeout(fallbackRef.current);
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex min-h-[52px] max-w-md items-center gap-3 rounded-full border border-line2 bg-surface-elevated px-5 py-3 text-sm text-body">
        {phase === "speaking" ? (
          <>
            <span className="flex-1 text-center">
              {typed}
              <span className="animate-blink ml-0.5 inline-block h-[14px] w-[2px] translate-y-[2px] bg-gold" />
            </span>
            {supported && (
              <button
                type="button"
                onClick={() => speak(false)}
                aria-label={voicePlaying ? "Playing greeting" : "Replay greeting"}
                title={voicePlaying ? "Playing…" : "Tap to hear it"}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line2 text-[10px] text-sub transition hover:border-gold hover:text-gold"
              >
                {voicePlaying ? (
                  <span className="flex h-3 items-center gap-[2px]">
                    {REPLAY_WAVE_HEIGHTS.map((h, i) => (
                      <span
                        key={i}
                        className="animate-wave-bar w-[2px] rounded-full bg-gold"
                        style={{ height: h * 0.6, animationDelay: `${-1.05 + i * 0.15}s` }}
                      />
                    ))}
                  </span>
                ) : (
                  "▶"
                )}
              </button>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={playGreeting}
            aria-label="Hear the greeting again"
            title="Tap to hear it again"
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
