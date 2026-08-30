"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/auth/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const { error } = await authClient.signIn.email({ email, password });
    if (error) return setError(error.message ?? "Sign in failed.");
    router.push("/app/notes");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <input className="w-full rounded-lg border border-neutral-300 px-3 py-2" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input className="w-full rounded-lg border border-neutral-300 px-3 py-2" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button className="w-full rounded-lg bg-neutral-900 px-3 py-2 text-white dark:bg-neutral-100 dark:text-black" type="submit">Sign in</button>
      <p className="text-sm text-neutral-500">New here? <Link className="underline" href="/register">Create an account</Link></p>
    </form>
  );
}
