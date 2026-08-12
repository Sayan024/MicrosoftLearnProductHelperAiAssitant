# Microsoft Docs Assistant

A focused Microsoft knowledge assistant: ask a question, it searches the Microsoft Learn MCP,
grounds the answer in the retrieved documentation via an OpenRouter free model, and shows the
Microsoft Learn sources used.

## Features

- **Grounded answers only** — responses are generated strictly from retrieved Microsoft Learn
  documentation, with an explicit "insufficient documentation" fallback instead of guessed answers.
- **Cited sources** — every answer is paired with the Microsoft Learn pages it was drawn from.
- **Live Microsoft Learn search** — queries `microsoft_docs_search` via the official Microsoft
  Learn MCP endpoint, then falls back to `microsoft_docs_fetch` for full-page content when an
  excerpt is too thin to answer confidently.
- **Topic guardrail** — a keyword pre-filter declines clearly off-topic questions before spending
  an MCP/model call, while still allowing natural follow-up questions mid-conversation.
- **Conversational follow-ups** — recent chat history is passed back to the model so users can ask
  follow-up questions without repeating the product name.
- **Resilient MCP client** — the MCP session is cached and timeout-guarded, dropping and
  reconnecting automatically on failure instead of leaving requests hanging.
- **Free-model fallback chain** — supports multiple comma-separated OpenRouter `:free` model ids,
  tried in order.
- **No persisted data** — no database, accounts, or stored history; each browser session is
  self-contained.

## Tech stack

**Frontend**
- React 18 + TypeScript
- Vite (dev server and build)

**Backend**
- Node.js + Express
- Model Context Protocol SDK (`@modelcontextprotocol/sdk`) over Streamable HTTP, talking to the
  Microsoft Learn MCP endpoint
- OpenRouter API for answer generation

**Tooling**
- `tsx` for running/watching the TypeScript server
- `concurrently` for running the client and server together in development

## How it works

```
Question → Microsoft Learn MCP (microsoft_docs_search / microsoft_docs_fetch)
         → Retrieved documentation
         → OpenRouter free model (answers only from that documentation)
         → Grounded answer + Microsoft Learn source links
```

The only server-side code is `server/index.ts` — a single `/api/ask` route needed to keep the
`OPENROUTER_API_KEY` off the client and to talk to the Microsoft Learn MCP endpoint
(`https://learn.microsoft.com/api/mcp`) over Streamable HTTP. There is no database, no
authentication, and no other backend infrastructure.
