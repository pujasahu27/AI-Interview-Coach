import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { creditUserForPayment } from "@/lib/creditPayment";
import { verifyWebhookSignature } from "@/lib/razorpay";

// Razorpay webhook: authoritative fallback in case the client never returns
// from Checkout (closed tab, network drop) to hit /api/payments/verify.
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");
  if (!signature || !verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  if (event.event !== "payment.captured") {
    return NextResponse.json({ received: true });
  }

  const payment = event.payload?.payment?.entity;
  const orderId = payment?.order_id;
  const paymentId = payment?.id;
  if (typeof orderId !== "string" || typeof paymentId !== "string") {
    return NextResponse.json({ received: true });
  }

  const paymentRef = adminDb.collection("payments").doc(orderId);
  const paymentSnap = await paymentRef.get();
  const paymentDoc = paymentSnap.data();
  if (!paymentDoc) {
    return NextResponse.json({ received: true });
  }

  await creditUserForPayment(paymentRef, paymentDoc.uid, paymentId);

  return NextResponse.json({ received: true });
}
