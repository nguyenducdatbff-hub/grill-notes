"use client";
import { useEffect } from "react";
import { isTheme } from "@/lib/theme";

export function ThemeProvider() {
  useEffect(() => {
    const stored = localStorage.getItem("grill-theme");
    if (stored && isTheme(stored)) document.documentElement.dataset.theme = stored;
    else if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) document.documentElement.dataset.theme = "dark";
  }, []);
  return null;
}
