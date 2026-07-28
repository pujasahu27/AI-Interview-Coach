import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getCreditStatus } from "@/lib/credits";
import { creditUserForPayment } from "@/lib/creditPayment";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { getCurrentUser } from "@/lib/session";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const orderId = body?.razorpay_order_id;
  const paymentId = body?.razorpay_payment_id;
  const signature = body?.razorpay_signature;
  if (
    typeof orderId !== "string" ||
    typeof paymentId !== "string" ||
    typeof signature !== "string"
  ) {
    return NextResponse.json({ error: "missing payment fields" }, { status: 400 });
  }

  const paymentRef = adminDb.collection("payments").doc(orderId);
  const paymentSnap = await paymentRef.get();
  if (!paymentSnap.exists || paymentSnap.data()?.uid !== user.uid) {
    return NextResponse.json({ error: "order not found" }, { status: 404 });
  }

  if (!verifyPaymentSignature({ orderId, paymentId, signature })) {
    await paymentRef.set({ status: "failed" }, { merge: true });
    return NextResponse.json({ error: "payment verification failed" }, { status: 400 });
  }

  await creditUserForPayment(paymentRef, user.uid, paymentId);

  const credits = await getCreditStatus(user.uid);
  return NextResponse.json({ success: true, credits });
}
