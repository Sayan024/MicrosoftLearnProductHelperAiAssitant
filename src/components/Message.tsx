import { useState } from "react";
import type { ChatMessage } from "../types/index.ts";
import Markdown from "./Markdown.tsx";
import SourceList from "./SourceList.tsx";

export default function Message({ message }: { message: ChatMessage }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable; silently ignore.
    }
  }

  const isUser = message.role === "user";

  return (
    <div className={`message ${isUser ? "user" : "assistant"}`}>
      <span className="message-role">{isUser ? "You" : "Assistant"}</span>
      <div className={`message-bubble${message.error ? " error" : ""}`}>
        <Markdown content={message.content} />
      </div>

      {!isUser && !message.error && message.sources && message.sources.length > 0 && (
        <SourceList sources={message.sources} />
      )}

      {!isUser && !message.error && (
        <div className="message-actions">
          <button type="button" className="text-button" onClick={handleCopy}>
            {copied ? "Copied" : "Copy answer"}
          </button>
        </div>
      )}
    </div>
  );
}
