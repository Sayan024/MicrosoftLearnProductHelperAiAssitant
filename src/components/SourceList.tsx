import type { Source } from "../types/index.ts";

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "learn.microsoft.com";
  }
}

export default function SourceList({ sources }: { sources: Source[] }) {
  if (sources.length === 0) return null;

  return (
    <div className="source-list">
      <div className="source-list-title">Sources</div>
      {sources.map((source) => (
        <a
          key={source.url}
          className="source-card"
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="source-card-domain">
            <span className="source-dot" aria-hidden="true" />
            {domainOf(source.url)}
          </div>
          <div className="source-card-title">{source.title}</div>
          {source.description && <div className="source-card-desc">{source.description}</div>}
        </a>
      ))}
    </div>
  );
}
