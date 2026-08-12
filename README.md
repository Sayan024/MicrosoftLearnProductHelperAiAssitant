# Microsoft Docs Assistant

A focused Microsoft knowledge assistant: ask a question, it searches the Microsoft Learn MCP,
grounds the answer in the retrieved documentation via an OpenRouter free model, and shows the
Microsoft Learn sources used.

## Setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Copy the env template and fill in your OpenRouter key + model:

   ```sh
   cp .env.example .env
   ```

   - `OPENROUTER_API_KEY` — get a free key at https://openrouter.ai/keys
   - `OPENROUTER_MODEL` — one or more comma-separated `:free` model ids. Check what's currently
     free at https://openrouter.ai/models?max_price=0 (free models rotate; the first id is
     primary, the rest are automatic fallbacks).

3. Run the app (starts the Vite dev server on :5173 and the API server on :8787, proxied together):

   ```sh
   npm run dev
   ```

   Open http://localhost:5173.

## Production

```sh
npm run build
NODE_ENV=production npm start
```

This serves the built frontend and the `/api/ask` route from a single Express process on `PORT`
(default 8787).

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
