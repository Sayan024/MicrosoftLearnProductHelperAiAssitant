import express from "express";
import type { Request, Response } from "express";
import { app } from "./app.ts";

const PORT = Number(process.env.PORT ?? 8787);

if (process.env.NODE_ENV === "production") {
  const path = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  const distDir = path.join(dirname, "..", "dist");
  app.use(express.static(distDir));
  app.get(/.*/, (_req: Request, res: Response) => {
    res.sendFile(path.join(distDir, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
