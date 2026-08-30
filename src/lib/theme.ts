export const THEMES = ["light", "dark", "sepia", "night"] as const;
export type Theme = (typeof THEMES)[number];

export function isTheme(v: string): v is Theme {
  return (THEMES as readonly string[]).includes(v);
}

export function nextTheme(current: Theme): Theme {
  return THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];
}
