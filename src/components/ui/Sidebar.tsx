import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { LinkButton } from "@/components/ui/Button";
import { Orb } from "@/components/ui/Orb";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    key: "dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/history",
    label: "History",
    key: "history",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.5 2" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Profile",
    key: "profile",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" />
      </svg>
    ),
  },
] as const;

export function Sidebar({
  active,
  userLabel,
  userPlan,
}: {
  active: "dashboard" | "history" | "profile";
  userLabel: string;
  userPlan: string;
}) {
  const initials = userLabel
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="sticky top-0 flex h-screen w-[236px] shrink-0 flex-col border-r border-line bg-surface p-3">
      <Link href="/dashboard" className="flex items-center gap-2 px-2 pb-5 pt-2 text-base font-semibold text-white">
        <Orb size={22} />
        AI Interview Coach
      </Link>

      <LinkButton href="/dashboard/new" variant="gold" size="sm" fullWidth className="mb-5">
        + New Interview
      </LinkButton>

      <p className="px-3 pb-1.5 pt-1 font-mono text-[10px] uppercase tracking-[.12em] text-muted">
        Menu
      </p>
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className={`mb-0.5 flex items-center gap-2.5 rounded-r-lg border-l-2 py-2 pl-3 pr-2.5 text-[13.5px] transition-all duration-200 ${
            active === item.key
              ? "border-gold bg-gold-faint text-gold"
              : "border-transparent text-sub hover:border-line2 hover:bg-surface-elevated hover:text-foreground"
          }`}
        >
          <span className={active === item.key ? "text-gold" : "text-muted"}>{item.icon}</span>
          {item.label}
        </Link>
      ))}
      <div className="mt-auto flex items-center gap-2.5 border-t border-line pt-3.5">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold text-on-accent"
          style={{ background: "linear-gradient(135deg, var(--gold), var(--coral))" }}
        >
          {initials || "U"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-medium text-foreground">{userLabel}</p>
          <p className="truncate text-[11px] text-muted">{userPlan}</p>
        </div>
        <SignOutButton />
      </div>
    </aside>
  );
}
