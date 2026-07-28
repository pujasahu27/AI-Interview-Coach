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
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
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
    <div className="w-full max-w-sm space-y-6 rounded-[20px] border border-line2 bg-surface p-8 shadow-2xl shadow-black/40">
      <div className="flex gap-1 rounded-full border border-line2 p-1 text-sm font-medium">
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={`flex-1 rounded-full px-4 py-2 transition ${mode === "signin" ? "bg-gold text-on-accent" : "text-sub"}`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex-1 rounded-full px-4 py-2 transition ${mode === "signup" ? "bg-gold text-on-accent" : "text-sub"}`}
        >
          Sign up
        </button>
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
        {error && <p className="text-sm text-coral">{error}</p>}
        <Button type="submit" variant="gold" fullWidth disabled={pending}>
          {mode === "signup" ? "Create account" : "Sign in"}
        </Button>
      </form>

      <div className="flex items-center gap-3 text-xs text-muted">
        <div className="h-px flex-1 bg-line" />
        or
        <div className="h-px flex-1 bg-line" />
      </div>

      <Button variant="dark" fullWidth disabled={pending} onClick={handleGoogleSignIn}>
        Continue with Google
      </Button>
    </div>
  );
}
