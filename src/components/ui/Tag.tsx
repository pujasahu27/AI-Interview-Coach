export function Tag({
  children,
  tone = "gold",
}: {
  children: React.ReactNode;
  tone?: "gold" | "coral" | "green";
}) {
  const toneClasses = {
    gold: "bg-gold-faint text-gold border-gold/20",
    coral: "bg-coral/10 text-coral border-coral/20",
    green: "bg-green/10 text-green border-green/25",
  }[tone];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 font-mono text-xs font-semibold transition-transform duration-150 hover:-translate-y-0.5 ${toneClasses}`}
    >
      {children}
    </span>
  );
}
