import { headers } from "next/headers";
import { auth } from "@/auth";

export async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");
  return session.user;
}

export async function getOptionalUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}
