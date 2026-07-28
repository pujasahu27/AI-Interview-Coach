"use client";

import { useEffect, useRef, useState } from "react";

const COLOR_CLASSES = {
  gold: "bg-gold",
  green: "bg-green",
  coral: "bg-coral",
};

function colorFor(value: number, max: number): keyof typeof COLOR_CLASSES {
  const ratio = value / max;
  if (ratio >= 0.85) return "green";
  if (ratio >= 0.6) return "gold";
  return "coral";
}

export function ScoreBar({
  label,
  value,
  max = 10,
}: {
  label: string;
  value: number;
  max?: number;
}) {
  const [filled, setFilled] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setFilled(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const color = colorFor(value, max);

  return (
    <div className="flex items-center justify-between gap-4 border-b border-line py-3.5 last:border-b-0">
      <span className="text-sm text-body">{label}</span>
      <div ref={ref} className="h-[5px] flex-1 overflow-hidden rounded-full bg-line2">
        <div
          className={`h-full origin-left rounded-full transition-transform duration-[1200ms] ease-[cubic-bezier(.16,1,.3,1)] ${COLOR_CLASSES[color]}`}
          style={{ transform: filled ? `scaleX(${value / max})` : "scaleX(0)" }}
        />
      </div>
      <span
        className={`w-8 text-right font-mono text-[13px] ${color === "gold" ? "text-gold" : color === "green" ? "text-green" : "text-coral"}`}
      >
        {value}
      </span>
    </div>
  );
}
