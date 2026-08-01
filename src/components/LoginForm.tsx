"use client";

import { FirebaseError } from "firebase/app";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  establishServerSession,
  signInWithEmail,
  signInWithGooglePopup,
  signUpWithEmail,
} from "@/lib/firebase-client";

function friendlyError(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "An account with this email already exists. Try signing in instead.";
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "Incorrect email or password.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      case "auth/popup-closed-by-user":
        return "Sign-in popup was closed before completing.";
      default:
        return "Something went wrong. Please try again.";
    }
  }
  return "Something went wrong. Please try again.";
}

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setPending(true);
    try {
      const credential =
        mode === "signup"
          ? await signUpWithEmail(email, password)
          : await signInWithEmail(email, password);
      await establishServerSession(credential.user);
      router.push("/dashboard");
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setPending(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setPending(true);
    try {
      const credential = await signInWithGooglePopup();
      await establishServerSession(credential.user);
      router.push("/dashboard");
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="w-full max-w-sm space-y-6 rounded-[20px] border border-line2 bg-surface p-8 shadow-[0_40px_80px_-24px_rgba(0,0,0,.55)]">
      <div>
        <h2 className="font-serif text-2xl font-normal tracking-tight text-white">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h2>
        <p className="mt-1 text-sm text-sub">
          {mode === "signup"
            ? "Start with 7 free interview turns — no card required."
            : "Log in to keep practicing."}
        </p>
      </div>

      <Button variant="dark" fullWidth disabled={pending} onClick={handleGoogleSignIn}>
        <svg width="16" height="16" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.89c2.27-2.09 3.58-5.17 3.58-8.82Z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.89-3c-1.08.73-2.46 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.09A12 12 0 0 0 12 24Z"
          />
          <path
            fill="#FBBC05"
            d="M5.27 14.28a7.2 7.2 0 0 1 0-4.56V6.63H1.26a12 12 0 0 0 0 10.74l4.01-3.09Z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.76 0 3.34.6 4.59 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.26 6.63l4.01 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
          />
        </svg>
        Continue with Google
      </Button>

      <div className="flex items-center gap-3 text-xs text-muted">
        <div className="h-px flex-1 bg-line" />
        or
        <div className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-sub">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-line2 bg-surface-elevated px-3.5 py-2.5 text-sm transition-colors focus:border-gold focus:outline-none"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium text-sub">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-line2 bg-surface-elevated px-3.5 py-2.5 text-sm transition-colors focus:border-gold focus:outline-none"
          />
        </div>
        {mode === "signup" && (
          <div className="space-y-1">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-sub">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-lg border border-line2 bg-surface-elevated px-3.5 py-2.5 text-sm transition-colors focus:border-gold focus:outline-none"
            />
          </div>
        )}
        {error && <p className="text-sm text-coral">{error}</p>}
        <Button type="submit" variant="gold" fullWidth disabled={pending}>
          {mode === "signup" ? "Start Free Trial" : "Log in"}
        </Button>
      </form>

      <p className="text-center text-sm text-sub">
        {mode === "signup" ? (
          <>
            Already a member?{" "}
            <button
              type="button"
              onClick={() => setMode("signin")}
              className="font-medium text-gold hover:underline"
            >
              Log in
            </button>
          </>
        ) : (
          <>
            New here?{" "}
            <button
              type="button"
              onClick={() => setMode("signup")}
              className="font-medium text-gold hover:underline"
            >
              Start for free
            </button>
          </>
        )}
      </p>
    </div>
  );
}
