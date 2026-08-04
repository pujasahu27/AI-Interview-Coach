import "server-only";

import type { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";

export type CreditStatus = {
  used: number;
  limit: number;
  remaining: number;
  unlimited: boolean;
  unlimitedUntil: number | null;
};

export function creditStatusFromUserData(
  data: Record<string, unknown> | undefined,
): CreditStatus {
  const used = (data?.freeTurnsUsed as number) ?? 0;
  const limit = (data?.freeTurnsLimit as number) ?? 0;
  const unlimitedUntilMillis =
    (data?.unlimitedUntil as Timestamp | undefined)?.toMillis() ?? null;
  const unlimited = unlimitedUntilMillis != null && unlimitedUntilMillis > Date.now();
  return {
    used,
    limit,
    remaining: Math.max(limit - used, 0),
    unlimited,
    unlimitedUntil: unlimitedUntilMillis,
  };
}

// Fetches the user doc itself. Prefer creditStatusFromUserData() when the
// caller already has the doc (avoids a duplicate Firestore round trip).
export async function getCreditStatus(uid: string): Promise<CreditStatus> {
  const snapshot = await adminDb.collection("users").doc(uid).get();
  return creditStatusFromUserData(snapshot.data());
}

export function hasCreditsRemaining(credits: CreditStatus): boolean {
  return credits.unlimited || credits.remaining > 0;
}

export function isUnlimitedActive(data: Record<string, unknown> | undefined): boolean {
  const until = (data?.unlimitedUntil as Timestamp | undefined)?.toMillis();
  return until != null && until > Date.now();
}
