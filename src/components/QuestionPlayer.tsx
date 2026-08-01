"use client";

import { useEffect, useRef, useState } from "react";
import { Orb } from "@/components/ui/Orb";
import { speakText } from "@/lib/speech";

const WAVE_HEIGHTS = [5, 14, 9, 18, 11, 7, 15];

export function QuestionPlayer({
  text,
  onSpeechEnd,
}: {
  text: string;
  onSpeechEnd?: () => void;
}) {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const lastSpokenRef = useRef<string | null>(null);

  useEffect(() => {
    // window.speechSynthesis only exists client-side; syncing it into state
    // here (instead of a lazy useState initializer) keeps the first client
    // render matching the server-rendered HTML and avoids a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(Boolean(window.speechSynthesis));
  }, []);

  useEffect(() => {
    if (lastSpokenRef.current === text) return;
    lastSpokenRef.current = text;
    if (typeof window === "undefined" || !window.speechSynthesis) {
      onSpeechEnd?.();
      return;
    }
    speak(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  function speak(isInitial: boolean) {
    void speakText(text, {
      onStart: () => setSpeaking(true),
      onEnd: () => {
        setSpeaking(false);
        if (isInitial) onSpeechEnd?.();
      },
      onError: () => {
        setSpeaking(false);
        if (isInitial) onSpeechEnd?.();
      },
    });
  }

  return (
    <div className="flex flex-col items-center gap-7 text-center">
      <Orb size={108} withRings={speaking} className={speaking ? "" : "opacity-95"} />

      <div className="flex flex-col items-center gap-2.5">
        <div className="flex items-center gap-2.5">
          <p className="font-mono text-[10.5px] uppercase tracking-[.16em] text-gold">
            Your Interviewer
          </p>
          <button
            type="button"
            onClick={() => speak(false)}
            disabled={!supported}
            aria-label="Replay question"
            title={supported ? "Replay question" : "Voice unsupported in this browser"}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line2 text-[9px] text-sub transition hover:border-gold hover:text-gold disabled:opacity-30"
          >
            ▶
          </button>
        </div>
        <span className="flex h-4 items-center gap-[3px]">
          {speaking
            ? WAVE_HEIGHTS.map((h, i) => (
                <span
                  key={i}
                  className="animate-wave-bar w-[2.5px] rounded-full bg-gold"
                  style={{ height: h * 0.8, animationDelay: `${-1.05 + i * 0.15}s` }}
                />
              ))
            : (
                <span className="font-mono text-[10.5px] text-muted">
                  {supported ? "tap ▶ to replay" : "voice unsupported — read below"}
                </span>
              )}
        </span>
      </div>

      <p className="max-w-xl text-balance font-serif text-[27px] font-normal leading-[1.3] tracking-tight text-white">
        {text}
      </p>
    </div>
  );
}
