import type { Source } from "../src/types/index.ts";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const SYSTEM_INSTRUCTION = `You are a Microsoft documentation assistant.

Answer questions about Microsoft products using ONLY the Microsoft Learn documentation supplied in the context.

Rules:
- Do not invent Microsoft features, APIs, configuration options, limits, commands, or product behavior.
- Prefer information explicitly supported by the supplied Microsoft Learn content.
- If the documentation does not contain enough information, say that the available Microsoft Learn documentation is insufficient.
- Do not fabricate citations or URLs.
- Keep answers concise and practical.
- For how-to questions, provide numbered steps.
- For comparison questions, use a table when useful.
- Preserve official Microsoft terminology.`;

export interface GenerateAnswerParams {
  question: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  documentation: string;
  sources: Source[];
}

export class OpenRouterError extends Error {}
export class OpenRouterEmptyResponseError extends Error {}

function buildUserPrompt(params: GenerateAnswerParams): string {
  const sourceList = params.sources.map((s) => `- ${s.title}: ${s.url}`).join("\n") || "(none found)";

  return `USER QUESTION
---
${params.question}

MICROSOFT LEARN DOCUMENTATION
---
${params.documentation || "(no relevant documentation was retrieved)"}

MICROSOFT LEARN SOURCES
---
${sourceList}

INSTRUCTIONS
---
Answer the user's question using only the Microsoft Learn documentation above.
If the documentation is insufficient, explicitly say so.`;
}

export async function generateAnswer(params: GenerateAnswerParams): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new OpenRouterError("OPENROUTER_API_KEY is not configured on the server.");
  }

  const models = (process.env.OPENROUTER_MODEL ?? "")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);

  if (models.length === 0) {
    throw new OpenRouterError(
      "OPENROUTER_MODEL is not configured. Set a free model id from https://openrouter.ai/models?max_price=0"
    );
  }

  const recentHistory = params.history.slice(-6);

  // Wraps the whole request, including body streaming (response.json()), not just the
  // initial fetch() — a timeout/network failure can otherwise surface mid-stream, after
  // fetch() already resolved, and slip past a narrower try/catch as an uncaught error.
  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-Title": "Microsoft Docs Assistant",
      },
      signal: AbortSignal.timeout(45_000), // generous: the `models` fallback list can retry sequentially server-side
      body: JSON.stringify({
        model: models[0],
        models: models.length > 1 ? models : undefined,
        temperature: 0.2,
        messages: [
          { role: "system", content: SYSTEM_INSTRUCTION },
          ...recentHistory,
          { role: "user", content: buildUserPrompt(params) },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new OpenRouterError(`OpenRouter request failed (${response.status}): ${body.slice(0, 500)}`);
    }

    const data: any = await response.json();
    const answer: string | undefined = data?.choices?.[0]?.message?.content;

    if (!answer || !answer.trim()) {
      throw new OpenRouterEmptyResponseError("OpenRouter returned an empty response.");
    }

    return answer.trim();
  } catch (err) {
    if (err instanceof OpenRouterError || err instanceof OpenRouterEmptyResponseError) throw err;
    throw new OpenRouterError(`Could not reach OpenRouter: ${(err as Error).message}`);
  }
}
