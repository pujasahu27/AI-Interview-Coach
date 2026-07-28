import { NextResponse } from "next/server";
import { adminDb, FieldValue } from "@/lib/firebase-admin";
import { isPlanId, PLANS } from "@/lib/payments";
import { getRazorpayClient, isRazorpayConfigured } from "@/lib/razorpay";
import { getCurrentUser } from "@/lib/session";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!isRazorpayConfigured()) {
    return NextResponse.json(
      { error: "Payments are not configured yet. Please try again later." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null);
  const planId = body?.planId;
  if (!isPlanId(planId)) {
    return NextResponse.json({ error: "invalid plan" }, { status: 400 });
  }
  const plan = PLANS[planId];

  const razorpay = getRazorpayClient();
  const receipt = `${user.uid.slice(0, 16)}_${Date.now()}`;
  let order;
  try {
    order = await razorpay.orders.create({
      amount: plan.amountInPaise,
      currency: "INR",
      receipt,
      notes: { uid: user.uid, planId },
    });
  } catch (error) {
    console.error("razorpay order creation failed:", error);
    return NextResponse.json(
      { error: "Could not start payment. Please try again." },
      { status: 502 },
    );
  }

  await adminDb.collection("payments").doc(order.id).set({
    uid: user.uid,
    planId,
    orderId: order.id,
    amountInPaise: plan.amountInPaise,
    status: "created",
    createdAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({
    orderId: order.id,
    amountInPaise: plan.amountInPaise,
    currency: "INR",
    keyId: process.env.RAZORPAY_KEY_ID,
    plan: { id: plan.id, label: plan.label },
  });
}
