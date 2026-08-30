"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Search, BarChart3, Focus, Settings, Library } from "lucide-react";

const items = [
  { href: "/app/notes", label: "Notes", icon: FileText },
  { href: "/app/graph", label: "Graph", icon: Search },
  { href: "/app/digest", label: "Digest", icon: BarChart3 },
  { href: "/app/focus", label: "Focus", icon: Focus },
  { href: "/app/templates", label: "Templates", icon: Library },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-56 shrink-0 border-r border-neutral-200 bg-white p-4 md:block dark:border-neutral-800 dark:bg-neutral-900">
      <Link href="/app/notes" className="mb-6 block text-lg font-semibold">Grill</Link>
      <nav className="space-y-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${active ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black" : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"}`}>
              <Icon size={16} /> {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
