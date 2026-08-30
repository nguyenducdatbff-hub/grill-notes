export type Evaluation = { strengths: string[]; suggestions: string[]; knowledgeToMaster: string[] };

export function buildEvaluatePrompt(title: string, body: string): string {
  return `You are a senior reviewer for the note titled "${title}".

Note body:
${body.slice(0, 8000)}

Respond with ONLY a JSON object (no markdown fences) of the form:
{"strengths": ["..."], "suggestions": ["..."], "knowledgeToMaster": ["..."]}
- strengths: 2-3 things done well
- suggestions: 2-3 concrete improvements
- knowledgeToMaster: 2-3 topics the author should study to go deeper on this subject`;
}

export function parseEvaluation(raw: string): Evaluation {
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return { strengths: [], suggestions: [], knowledgeToMaster: [] };
    const j = JSON.parse(match[0]);
    return {
      strengths: Array.isArray(j.strengths) ? j.strengths.map(String) : [],
      suggestions: Array.isArray(j.suggestions) ? j.suggestions.map(String) : [],
      knowledgeToMaster: Array.isArray(j.knowledgeToMaster) ? j.knowledgeToMaster.map(String) : [],
    };
  } catch {
    return { strengths: [], suggestions: [], knowledgeToMaster: [] };
  }
}
