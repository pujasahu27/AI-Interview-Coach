export function Meter({ label, percent }: { label: string; percent: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between font-mono text-[11px] text-muted">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-line2">
        <div
          className="h-full rounded-full bg-gradient-to-r from-coral to-gold transition-[width] duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
