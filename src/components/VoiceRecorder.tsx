"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

function getSpeechRecognitionCtor() {
  return typeof window !== "undefined"
    ? window.SpeechRecognition ?? window.webkitSpeechRecognition
    : undefined;
}

export function VoiceRecorder({ value, onChange, disabled }: Props) {
  const [supported] = useState(() => Boolean(getSpeechRecognitionCtor()));
  const [recording, setRecording] = useState(false);
  const [interim, setInterim] = useState("");
  const recognitionRef = useRef<InstanceType<NonNullable<typeof window.SpeechRecognition>> | null>(
    null,
  );
  const baseValueRef = useRef(value);

  useEffect(() => {
    const SpeechRecognitionCtor = getSpeechRecognitionCtor();
    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }
      if (finalText) {
        baseValueRef.current = `${baseValueRef.current} ${finalText}`.trim();
        onChange(baseValueRef.current);
      }
      setInterim(interimText);
    };
    recognition.onerror = () => setRecording(false);
    recognition.onend = () => setRecording(false);

    recognitionRef.current = recognition;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleRecording() {
    if (!recognitionRef.current) return;
    if (recording) {
      recognitionRef.current.stop();
      setRecording(false);
    } else {
      baseValueRef.current = value;
      setInterim("");
      recognitionRef.current.start();
      setRecording(true);
    }
  }

  return (
    <div className="space-y-3">
      {supported && (
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={toggleRecording}
            disabled={disabled}
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-2xl shadow-[0_0_24px_rgba(240,180,41,.4)] transition disabled:opacity-40 ${
              recording ? "animate-mic-pulse bg-coral text-on-accent" : "bg-gold text-on-accent hover:scale-110"
            }`}
            aria-label={recording ? "Stop recording" : "Start recording"}
          >
            {recording ? "■" : "🎤"}
          </button>
          <span className="text-sm text-sub">
            {recording ? "Listening… speak your answer" : "Tap to record your answer"}
          </span>
        </div>
      )}
      {interim && <p className="text-sm italic text-muted">{interim}</p>}
      <textarea
        rows={5}
        value={value}
        disabled={disabled}
        onChange={(event) => {
          baseValueRef.current = event.target.value;
          onChange(event.target.value);
        }}
        placeholder={
          supported
            ? "Your transcribed answer will appear here — you can edit it before submitting."
            : "Voice input isn't supported in this browser. Type your answer here."
        }
        className="w-full rounded-[20px] border border-line2 bg-surface-elevated px-4 py-3.5 text-sm leading-relaxed transition-colors focus:border-gold focus:outline-none"
      />
    </div>
  );
}
