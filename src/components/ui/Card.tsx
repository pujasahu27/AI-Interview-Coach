import type { ReactNode } from "react";

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[20px] border border-line2 bg-surface p-6 sm:p-9 ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
