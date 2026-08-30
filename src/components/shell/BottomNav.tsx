"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Waypoints, BarChart3, Focus, Settings } from "lucide-react";

const items = [
  { href: "/app/notes", label: "Notes", icon: FileText },
  { href: "/app/graph", label: "Graph", icon: Waypoints },
  { href: "/app/digest", label: "Digest", icon: BarChart3 },
  { href: "/app/focus", label: "Focus", icon: Focus },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur md:hidden">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link key={href} href={href} className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] ${active ? "text-[var(--text)]" : "text-[var(--muted)]"}`}>
            <Icon size={18} /> {label}
          </Link>
        );
      })}
    </nav>
  );
}
