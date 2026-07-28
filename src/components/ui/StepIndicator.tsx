export function StepIndicator({
  total,
  current,
}: {
  total: number;
  current: number;
}) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }, (_, i) => i + 1).map((step) => (
        <span
          key={step}
          className={`h-1 flex-1 rounded-full ${
            step < current ? "bg-gold" : step === current ? "bg-foreground" : "bg-line2"
          }`}
        />
      ))}
    </div>
  );
}

type WizardStep = { n: number; label: string };

export function WizardSteps({ steps, current }: { steps: WizardStep[]; current: number }) {
  return (
    <div className="sticky top-0 z-30 bg-background/90 py-3 backdrop-blur-sm">
      <div className="flex items-start">
        {steps.map((step) => {
          const status = step.n < current ? "done" : step.n === current ? "active" : "upcoming";
          return (
            <div key={step.n} className="relative flex flex-1 flex-col items-center gap-2">
              {step.n < steps.length && (
                <span
                  className={`absolute left-1/2 top-[13px] h-px w-full transition-colors duration-500 ${
                    status === "done" ? "bg-gold/50" : "bg-line2"
                  }`}
                />
              )}
              <span
                className={`relative z-10 flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border font-mono text-[11px] font-semibold transition-all duration-300 ${
                  status === "done"
                    ? "border-gold bg-gold text-on-accent"
                    : status === "active"
                      ? "border-gold text-gold shadow-[0_0_0_4px_rgba(240,180,41,.14)]"
                      : "border-line2 bg-surface text-muted"
                }`}
              >
                {status === "done" ? "✓" : step.n}
              </span>
              <span
                className={`font-mono text-[10px] uppercase tracking-[.08em] transition-colors duration-300 ${
                  status === "upcoming" ? "text-muted" : status === "active" ? "text-white" : "text-sub"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
