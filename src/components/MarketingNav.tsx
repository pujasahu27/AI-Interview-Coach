import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";
import { Orb } from "@/components/ui/Orb";

export function MarketingNav() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex h-[68px] items-center justify-between border-b border-line bg-background/70 pl-8 pr-6 backdrop-blur-md sm:pl-16 sm:pr-12">
      <Link href="/" className="flex items-center gap-2.5 text-[17px] font-semibold text-white">
        <Orb size={26} />
        AI Interview Coach
      </Link>
      <div className="flex items-center gap-3">
        <LinkButton href="/login" variant="ghost" size="sm">
          Log in
        </LinkButton>
        <LinkButton href="/login" variant="gold" size="sm">
          Start for Free
        </LinkButton>
      </div>
    </nav>
  );
}
