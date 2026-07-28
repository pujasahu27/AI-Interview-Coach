export type PlanId = "turns_10" | "turns_30" | "unlimited_30d";

export type Plan = {
  id: PlanId;
  label: string;
  description: string;
  amountInPaise: number;
  turns: number | null;
  unlimitedDays: number | null;
  highlight?: boolean;
};

export const PLANS: Record<PlanId, Plan> = {
  turns_10: {
    id: "turns_10",
    label: "10 more turns",
    description: "Top up 10 interview turns — great for one more round of practice.",
    amountInPaise: 14900,
    turns: 10,
    unlimitedDays: null,
  },
  turns_30: {
    id: "turns_30",
    label: "30 more turns",
    description: "Best value top-up — enough for several full mock interviews.",
    amountInPaise: 34900,
    turns: 30,
    unlimitedDays: null,
    highlight: true,
  },
  unlimited_30d: {
    id: "unlimited_30d",
    label: "Unlimited for 30 days",
    description: "Unlimited interview turns for a full month. No auto-renewal.",
    amountInPaise: 49900,
    turns: null,
    unlimitedDays: 30,
  },
};

export function isPlanId(value: unknown): value is PlanId {
  return typeof value === "string" && value in PLANS;
}

export function formatInr(amountInPaise: number): string {
  return `₹${(amountInPaise / 100).toLocaleString("en-IN")}`;
}
