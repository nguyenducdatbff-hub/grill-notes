export const AI_ACTIONS = ["explain", "improve", "expand", "simplify", "backlinks"] as const;
export type AiAction = (typeof AI_ACTIONS)[number];

const PROMPTS: Record<AiAction, string> = {
  explain: "Explain the following selection clearly and concisely, in the same language it is written:",
  improve: "Rewrite the following selection to be better written, clearer, and more polished. Output ONLY the rewritten text:",
  expand: "Expand the following selection with more useful detail and depth. Output ONLY the expanded text:",
  simplify: "Rewrite the following selection to be shorter and simpler while keeping all meaning. Output ONLY the simplified text:",
  backlinks: "List 3-5 existing or suggested note titles that could link to this selection, one per line, as plain titles without brackets:",
};

export function buildActionPrompt(action: AiAction, text: string): string {
  return `${PROMPTS[action]}\n\n"""\n${text.slice(0, 8000)}\n"""`;
}

export function replaceSelection(action: AiAction): boolean {
  return action === "improve" || action === "expand" || action === "simplify";
}
