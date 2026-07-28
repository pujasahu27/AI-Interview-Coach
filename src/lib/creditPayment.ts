import "server-only";

import type { DocumentReference } from "firebase-admin/firestore";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb, FieldValue } from "@/lib/firebase-admin";
import { PLANS, type PlanId } from "@/lib/payments";

const DAY_MS = 24 * 60 * 60 * 1000;

export async function creditUserForPayment(
  paymentRef: DocumentReference,
  uid: string,
  paymentId: string,
): Promise<void> {
  const userRef = adminDb.collection("users").doc(uid);

  await adminDb.runTransaction(async (transaction) => {
    const paymentSnap = await transaction.get(paymentRef);
    const payment = paymentSnap.data();
    if (!payment || payment.status === "captured") {
      return;
    }

    const plan = PLANS[payment.planId as PlanId];
    const userSnap = await transaction.get(userRef);
    const userData = userSnap.data();

    const updates: Record<string, unknown> = {};
    if (plan.turns) {
      updates.freeTurnsLimit = ((userData?.freeTurnsLimit as number) ?? 0) + plan.turns;
    }
    if (plan.unlimitedDays) {
      const currentUntil = (userData?.unlimitedUntil as Timestamp | undefined)?.toMillis();
      const base = currentUntil && currentUntil > Date.now() ? currentUntil : Date.now();
      updates.unlimitedUntil = Timestamp.fromMillis(base + plan.unlimitedDays * DAY_MS);
    }

    transaction.set(userRef, updates, { merge: true });
    transaction.set(
      paymentRef,
      { status: "captured", paymentId, capturedAt: FieldValue.serverTimestamp() },
      { merge: true },
    );
  });
}
