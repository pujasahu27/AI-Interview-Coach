import "server-only";

import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

function loadAdminCredentials() {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  const missing = [
    !projectId && "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    !clientEmail && "FIREBASE_ADMIN_CLIENT_EMAIL",
    !privateKey && "FIREBASE_ADMIN_PRIVATE_KEY",
  ].filter((name): name is string => Boolean(name));

  if (missing.length > 0) {
    throw new Error(
      `Firebase Admin is not configured: missing ${missing.join(", ")}. ` +
        "Set these in your deployment platform's environment variables " +
        "(e.g. Vercel -> Project -> Settings -> Environment Variables) and redeploy.",
    );
  }

  return { projectId, clientEmail, privateKey };
}

const adminApp = getApps().length
  ? getApp()
  : initializeApp({ credential: cert(loadAdminCredentials()) });

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
export { FieldValue };
