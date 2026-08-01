import { MarketingFooter } from "@/components/MarketingFooter";
import { MarketingNav } from "@/components/MarketingNav";
import { LinkButton } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Tag } from "@/components/ui/Tag";
import { formatInr, PLANS } from "@/lib/payments";

export default function PricingPage() {
  return (
    <div>
      <MarketingNav />

      <section className="relative overflow-hidden px-6 pb-16 pt-44 text-center">
        <div
          className="pointer-events-none absolute -top-52 left-1/2 h-[500px] w-[900px] -translate-x-1/2"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(240,180,41,.12) 0%, transparent 65%)" }}
        />
        <Reveal className="relative z-10 mx-auto max-w-xl">
          <span className="mb-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[.14em] text-sub before:h-px before:w-5 before:bg-muted before:content-[''] after:h-px after:w-5 after:bg-muted after:content-['']">
            Pricing
          </span>
          <h1 className="font-serif text-[clamp(40px,7vw,72px)] font-normal leading-[.95] tracking-tight text-white">
            Start <em className="text-gold italic">free.</em>
            <br />
            Pay only if you need more.
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-body">
            Every account starts with 7 free interview turns — no card required. Top up
            only if you use them all.
          </p>
        </Reveal>
      </section>

      <section className="relative z-10 px-6 pb-32">
        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-3">
          {Object.values(PLANS).map((plan, i) => (
            <Reveal key={plan.id} delay={i * 80}>
              <div
                className={`flex h-full flex-col gap-4 rounded-[20px] border p-7 transition-transform hover:-translate-y-1 ${
                  plan.highlight ? "border-gold bg-gold-faint" : "border-line2 bg-surface"
                }`}
              >
                {plan.highlight && <Tag tone="gold">Best value</Tag>}
                <p className="font-serif text-xl font-normal text-white">{plan.label}</p>
                <p className="text-sm leading-relaxed text-sub">{plan.description}</p>
                <p className="mt-auto font-serif text-4xl font-normal tracking-tight text-white">
                  {formatInr(plan.amountInPaise)}
                </p>
                <LinkButton href="/login" variant={plan.highlight ? "gold" : "dark"} fullWidth>
                  Start for Free
                </LinkButton>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-surface px-6 py-24 text-center">
        <Reveal>
          <h2 className="font-serif text-3xl font-normal tracking-tight text-white">
            Not sure yet?
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-body">
            Start with 7 free turns — no credit card, no commitment.
          </p>
          <div className="mt-8">
            <LinkButton href="/login" variant="gold" size="lg">
              Start for Free
            </LinkButton>
          </div>
        </Reveal>
      </section>

      <MarketingFooter />
    </div>
  );
}
