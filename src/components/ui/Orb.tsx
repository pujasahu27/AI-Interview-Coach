type Props = {
  size?: number;
  withRings?: boolean;
  className?: string;
};

export function Orb({ size = 90, withRings = false, className = "" }: Props) {
  return (
    <div
      className={`relative rounded-full animate-orb-float ${withRings ? "ring-pulse" : ""} ${className}`}
      style={{
        width: size,
        height: size,
        background:
          "radial-gradient(circle at 33% 28%, #f5c340 0%, #e8614a 45%, #7c6ef5 80%, #2a1a6e 100%)",
        boxShadow:
          "0 0 80px rgba(240,180,41,.3), 0 0 160px rgba(124,110,245,.15), 0 40px 80px rgba(0,0,0,.5)",
      }}
    >
      <span
        className="absolute rounded-[50%/65%_65%_35%_35%] bg-[#0a0800]"
        style={{ width: "15%", height: "27%", top: "36%", left: "31%", transform: "rotate(-14deg)" }}
      />
      <span
        className="absolute rounded-[50%/65%_65%_35%_35%] bg-[#0a0800]"
        style={{ width: "15%", height: "27%", top: "36%", right: "31%", transform: "rotate(14deg)" }}
      />
    </div>
  );
}
