"use client";
import { UserMenu } from "./UserMenu";

export function Topbar() {
  return (
    <header className="flex h-12 shrink-0 items-center justify-end border-b border-neutral-200 px-4 md:h-14 dark:border-neutral-800">
      <UserMenu />
    </header>
  );
}
