"use client";
import { UserMenu } from "./UserMenu";
import { ThemeToggle } from "../theme/ThemeToggle";

export function Topbar() {
  return (
    <header className="flex h-12 shrink-0 items-center justify-end gap-1 border-b border-[var(--border)] px-4 md:h-14">
      <ThemeToggle />
      <UserMenu />
    </header>
  );
}
