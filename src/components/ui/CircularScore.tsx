"use client";

import { useEffect, useState } from "react";

export function CircularScore({
  value,
  max = 10,
  size = 100,
}: {
  value: number;
  max?: number;
  size?: number;
}) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const radius = size / 2 - 8;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.max(0, Math.min(1, value / max));
  const dashOffset = animated ? circumference * (1 - ratio) : circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--line2)"
            strokeWidth={8}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--gold)"
            strokeWidth={8}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.16,1,.3,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-serif text-4xl font-normal text-white">
          {value}
        </div>
      </div>
      <span className="font-mono text-xs text-muted">out of {max}</span>
    </div>
  );
}
