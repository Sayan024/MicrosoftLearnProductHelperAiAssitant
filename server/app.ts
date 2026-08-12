import "dotenv/config";
import express from "express";
import type { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { fetchDoc, searchDocs } from "./mcpClient.ts";
import { generateAnswer, OpenRouterEmptyResponseError, OpenRouterError } from "./openrouter.ts";
import { isLikelyMicrosoftRelated } from "./topicGuard.ts";
import type { AskRequest, AskResponse, Source } from "../src/types/index.ts";

const MAX_SOURCES = 5;
const FETCH_THRESHOLD_CHARS = 300; // fetch full page when excerpts are this short or shorter

export const app = express();

// Vercel (and most PaaS hosts) sit in front of the app as a single reverse-proxy hop;
// trusting it is required for express-rate-limit to key off the real client IP
// (X-Forwarded-For) instead of the proxy's own address.
app.set("trust proxy", 1);

app.use(express.json({ limit: "1mb" }));

// /api/ask is the only route that costs money (MCP + OpenRouter calls), so it's the
// one worth protecting from a single client hammering it. Per-instance in-memory store
// is a soft limit (each Lambda instance tracks its own counts) — fine for deterring
// casual abuse without adding a Redis/KV dependency for a no-database hobby app.
const askLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response<AskResponse>) => {
    res.status(429).json({
      error: "rate_limited",
      message: "You're asking questions faster than I can look them up. Please wait a few minutes and try again.",
    });
  },
});

app.post("/api/ask", askLimiter, async (req: Request, res: Response<AskResponse>) => {
  const body = req.body as Partial<AskRequest>;
  const question = typeof body.question === "string" ? body.question.trim() : "";
  const history = Array.isArray(body.history) ? body.history : [];

  if (!question) {
    return res.status(400).json({ error: "bad_request", message: "A question is required." });
  }

  if (!isLikelyMicrosoftRelated(question, history)) {
    return res.status(200).json({
      error: "off_topic",
      message:
        "This assistant is focused on Microsoft products and services. Try asking about Azure, Microsoft 365, Fabric, Power BI, .NET, or another Microsoft technology.",
    });
  }

  let searchResults;
  try {
    searchResults = await searchDocs(question);
  } catch (err) {
    console.error("MCP search failed:", err);
    return res.status(502).json({
      error: "mcp_unreachable",
      message: "Microsoft Learn couldn't be reached right now. Please try again in a moment.",
    });
  }

  if (searchResults.length === 0) {
    return res.status(200).json({
      error: "no_docs_found",
      message:
        "I couldn't find relevant Microsoft Learn documentation for this question. Try asking with the Microsoft product name and the specific task or feature.",
    });
  }

  const topResults = searchResults.slice(0, MAX_SOURCES);

  // Fetch full-page content for results whose excerpt is too thin to answer from confidently.
  const enriched = await Promise.all(
    topResults.map(async (r) => {
      if (r.content.length >= FETCH_THRESHOLD_CHARS) return r;
      try {
        const full = await fetchDoc(r.url);
        return full ? { ...r, content: full.slice(0, 6000) } : r;
      } catch (err) {
        console.warn(`microsoft_docs_fetch failed for ${r.url}:`, err);
        return r;
      }
    })
  );

  const documentation = enriched
    .map((r, i) => `[${i + 1}] ${r.title} (${r.url})\n${r.content}`)
    .join("\n\n---\n\n");

  const sources: Source[] = enriched.map((r) => ({
    title: r.title,
    url: r.url,
    description: r.content.slice(0, 180).trim(),
  }));

  try {
    const answer = await generateAnswer({ question, history, documentation, sources });
    const insufficientDocs = /insufficient|couldn't find enough|not enough information/i.test(answer);
    return res.status(200).json({ answer, sources, insufficientDocs });
  } catch (err) {
    if (err instanceof OpenRouterEmptyResponseError) {
      return res.status(200).json({
        error: "empty_generation",
        message: "I found relevant Microsoft Learn documentation, but I couldn't generate a reliable answer from it.",
      });
    }
    if (err instanceof OpenRouterError) {
      console.error("OpenRouter error:", err.message);
      return res.status(502).json({
        error: "generation_failed",
        message: "I found the relevant Microsoft Learn documentation, but I couldn't generate the answer right now. Please try again.",
      });
    }
    console.error("Unexpected error:", err);
    return res.status(500).json({
      error: "generation_failed",
      message: "Something went wrong while preparing the answer. Please try again.",
    });
  }
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true });
});
