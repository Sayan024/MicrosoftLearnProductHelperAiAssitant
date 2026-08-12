import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { Source } from "../src/types/index.ts";

const MCP_URL = "https://learn.microsoft.com/api/mcp";
const CONNECT_TIMEOUT_MS = 15_000;
const CALL_TIMEOUT_MS = 20_000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

let clientPromise: Promise<Client> | null = null;

// Both connect() and callTool() are timeout-guarded and drop the cached client/session
// on any failure, so a hung connection (observed to happen under load in ways a
// standalone script doesn't reproduce) can never wedge the server permanently — the
// next request always gets a fresh attempt instead of awaiting a promise that never settles.
async function getClient(): Promise<Client> {
  if (!clientPromise) {
    clientPromise = withTimeout(
      (async () => {
        const client = new Client({ name: "ms-docs-assistant", version: "1.0.0" });
        const transport = new StreamableHTTPClientTransport(new URL(MCP_URL));
        await client.connect(transport);
        return client;
      })(),
      CONNECT_TIMEOUT_MS,
      "MCP connect"
    ).catch((err) => {
      clientPromise = null;
      throw err;
    });
  }
  return clientPromise;
}

async function callToolResilient(name: string, args: Record<string, unknown>) {
  const client = await getClient();
  try {
    return await withTimeout(client.callTool({ name, arguments: args }), CALL_TIMEOUT_MS, `MCP tool "${name}"`);
  } catch (err) {
    clientPromise = null;
    throw err;
  }
}

interface SearchResult extends Source {
  content: string;
}

/** Extracts text blocks from an MCP tool result, tolerant of both JSON and plain-text content. */
function extractText(result: { content?: unknown }): string[] {
  const content = Array.isArray(result.content) ? result.content : [];
  return content
    .filter((block: any) => block && block.type === "text" && typeof block.text === "string")
    .map((block: any) => block.text as string);
}

function parseSearchResults(textBlocks: string[]): SearchResult[] {
  const results: SearchResult[] = [];

  for (const text of textBlocks) {
    // The tool may return a JSON array/object of structured results...
    try {
      const parsed = JSON.parse(text);
      const items = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.results)
          ? parsed.results
          : [parsed];
      for (const item of items) {
        const url = item.url ?? item.contentUrl ?? item.link;
        if (!url) continue;
        results.push({
          title: item.title ?? url,
          url,
          content: item.content ?? item.excerpt ?? item.snippet ?? "",
        });
      }
      continue;
    } catch {
      // ...or Markdown-ish text with links. Fall back to regex extraction.
    }

    const linkPattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    let match: RegExpExecArray | null;
    const found: SearchResult[] = [];
    while ((match = linkPattern.exec(text)) !== null) {
      found.push({ title: match[1], url: match[2], content: "" });
    }
    if (found.length > 0) {
      found.forEach((item, i) => {
        const start = text.indexOf(item.url);
        const end = i + 1 < found.length ? text.indexOf(found[i + 1].url) : text.length;
        item.content = text.slice(start, end).replace(/^https?:\/\/\S+/, "").trim().slice(0, 800);
      });
      results.push(...found);
    } else if (text.trim()) {
      results.push({ title: "Microsoft Learn", url: MCP_URL, content: text.trim() });
    }
  }

  return results;
}

function stripFragment(url: string): string {
  const hashIndex = url.indexOf("#");
  return hashIndex === -1 ? url : url.slice(0, hashIndex);
}

/** The MCP search tool can return several content chunks from the same page (one per
 * section/anchor); merge them so each source page is represented once with its chunks
 * concatenated in order, rather than showing several near-identical source cards. */
function dedupeByUrl(results: SearchResult[]): SearchResult[] {
  const order: string[] = [];
  const byUrl = new Map<string, SearchResult>();

  for (const r of results) {
    const base = stripFragment(r.url);
    const existing = byUrl.get(base);
    if (existing) {
      existing.content = existing.content ? `${existing.content}\n\n${r.content}` : r.content;
    } else {
      byUrl.set(base, { ...r, url: base });
      order.push(base);
    }
  }

  return order.map((url) => byUrl.get(url)!);
}

export async function searchDocs(query: string): Promise<SearchResult[]> {
  const result = await callToolResilient("microsoft_docs_search", { query });
  return dedupeByUrl(parseSearchResults(extractText(result as { content?: unknown })));
}

export async function fetchDoc(url: string): Promise<string> {
  const result = await callToolResilient("microsoft_docs_fetch", { url });
  return extractText(result as { content?: unknown }).join("\n\n");
}
