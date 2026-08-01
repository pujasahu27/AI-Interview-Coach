import { getApp, getApps, initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  getRedirectResult,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
  type UserCredential,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const clientApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(clientApp);
export const googleProvider = new GoogleAuthProvider();

// Unused by any Phase 1 code — reserved for a later phase's realtime
// Firestore listeners (e.g. live interview turn updates).
export const db = getFirestore(clientApp);

export function signUpWithEmail(
  email: string,
  password: string,
): Promise<UserCredential> {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function signInWithEmail(
  email: string,
  password: string,
): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

export function signInWithGooglePopup(): Promise<UserCredential> {
  return signInWithPopup(auth, googleProvider);
}

// signInWithPopup is unreliable on mobile browsers (popups get blocked, or
// lose their connection back to the opener page) -- Firebase recommends the
// redirect flow there instead. The page navigates away and back; the result
// is picked up via getGoogleRedirectResult() on the next mount.
export function isMobileBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

export function signInWithGoogleRedirect(): Promise<void> {
  return signInWithRedirect(auth, googleProvider);
}

export function getGoogleRedirectResult(): Promise<UserCredential | null> {
  return getRedirectResult(auth);
}

export function signOutClient(): Promise<void> {
  return signOut(auth);
}

export async function establishServerSession(user: User): Promise<void> {
  const idToken = await user.getIdToken();
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!response.ok) {
    throw new Error("Failed to establish server session");
  }
}
