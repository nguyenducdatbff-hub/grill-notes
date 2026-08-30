"use client";
import { useRouter } from "next/navigation";
import { authClient } from "@/auth/client";
import { LogOut } from "lucide-react";

export function UserMenu() {
  const router = useRouter();
  const { data } = authClient.useSession();

  async function signOut() {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-sm text-neutral-600 sm:inline dark:text-neutral-300">{data?.user?.email}</span>
      <button onClick={signOut} title="Sign out" className="rounded-md p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800">
        <LogOut size={16} />
      </button>
    </div>
  );
}
