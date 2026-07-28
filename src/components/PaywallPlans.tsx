"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { formatInr, PLANS, type PlanId } from "@/lib/payments";

type Props = {
  configured: boolean;
  userEmail: string;
  userName: string;
};

export function PaywallPlans({ configured, userEmail, userName }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleBuy(planId: PlanId) {
    setError(null);
    setPending(planId);
    try {
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok) throw new Error(order?.error ?? "Could not start payment.");

      if (!window.Razorpay) {
        throw new Error("Payment SDK failed to load. Please refresh and try again.");
      }

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amountInPaise,
        currency: order.currency,
        order_id: order.orderId,
        name: "AI Interview Coach",
        description: order.plan.label,
        prefill: { name: userName, email: userEmail },
        theme: { color: "#f0b429" },
        handler: (response) => {
          void (async () => {
            try {
              const verifyRes = await fetch("/api/payments/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(response),
              });
              const verifyData = await verifyRes.json();
              if (!verifyRes.ok) {
                throw new Error(verifyData?.error ?? "Payment could not be verified.");
              }
              router.push("/dashboard");
              router.refresh();
            } catch (err) {
              setError(err instanceof Error ? err.message : "Payment could not be verified.");
              setPending(null);
            }
          })();
        },
        modal: {
          ondismiss: () => setPending(null),
        },
      });
      razorpay.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setPending(null);
    }
  }

  return (
    <div className="w-full">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      {!configured && (
        <p className="mb-5 rounded-xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral">
          Payments aren&apos;t live yet — check back soon.
        </p>
      )}

      <div className="grid w-full gap-4 sm:grid-cols-3">
        {Object.values(PLANS).map((plan) => (
          <div
            key={plan.id}
            className={`flex flex-col gap-4 rounded-[20px] border p-6 text-left ${
              plan.highlight ? "border-gold bg-gold-faint" : "border-line2 bg-surface"
            }`}
          >
            {plan.highlight && (
              <span className="w-fit rounded-full bg-gold px-2.5 py-1 font-mono text-[10px] uppercase tracking-[.08em] text-on-accent">
                Best value
              </span>
            )}
            <div>
              <p className="font-serif text-xl font-normal text-white">{plan.label}</p>
              <p className="mt-1 text-sm text-sub">{plan.description}</p>
            </div>
            <p className="font-serif text-3xl font-normal text-white">
              {formatInr(plan.amountInPaise)}
            </p>
            <Button
              variant={plan.highlight ? "gold" : "dark"}
              fullWidth
              disabled={!configured || pending !== null}
              onClick={() => handleBuy(plan.id)}
            >
              {pending === plan.id ? "Opening checkout…" : "Buy"}
            </Button>
          </div>
        ))}
      </div>

      {error && <p className="mt-4 text-center text-sm text-coral">{error}</p>}
    </div>
  );
}
