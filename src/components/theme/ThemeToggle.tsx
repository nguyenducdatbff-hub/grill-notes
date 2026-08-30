"use client";
import { useEffect, useState } from "react";
import { Sun, Moon, Coffee, MoonStar } from "lucide-react";
import { nextTheme, type Theme } from "@/lib/theme";

const ICONS: Record<Theme, typeof Sun> = { light: Sun, dark: Moon, sepia: Coffee, night: MoonStar };

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const current = (document.documentElement.dataset.theme ?? "light") as Theme;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(current);
  }, []);

  const toggle = () => {
    const next = nextTheme(theme);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("grill-theme", next);
    setTheme(next);
  };

  const Icon = ICONS[theme];
  return <button onClick={toggle} title="Switch theme" className="rounded-md p-2 text-[var(--muted)] hover:bg-[var(--border)]"><Icon size={16} /></button>;
}
