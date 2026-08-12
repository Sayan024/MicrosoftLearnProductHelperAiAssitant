import type { AskRequest, AskResponse, ChatRole } from "../types/index.ts";

const cache = new Map<string, AskResponse>();

function cacheKey(question: string, history: Array<{ role: ChatRole; content: string }>): string {
  return JSON.stringify({ q: question.trim().toLowerCase(), h: history.slice(-4) });
}

export async function askQuestion(
  question: string,
  history: Array<{ role: ChatRole; content: string }>,
  signal?: AbortSignal
): Promise<AskResponse> {
  const key = cacheKey(question, history);
  const cached = cache.get(key);
  if (cached) return cached;

  const payload: AskRequest = { question, history };

  const response = await fetch("/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok && response.status !== 200) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const data = (await response.json()) as AskResponse;

  if (!("error" in data)) {
    cache.set(key, data);
  }

  return data;
}
