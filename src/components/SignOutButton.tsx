"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOutClient } from "@/lib/firebase-client";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    setPending(true);
    try {
      await signOutClient();
      await fetch("/api/auth/session", { method: "DELETE" });
      router.push("/login");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={pending}
      title="Sign out"
      className="shrink-0 rounded-lg p-1.5 text-muted transition hover:bg-surface-elevated hover:text-foreground disabled:opacity-50"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="M16 17l5-5-5-5" />
        <path d="M21 12H9" />
      </svg>
    </button>
  );
}
