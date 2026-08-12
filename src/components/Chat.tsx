import { useRef, useState } from "react";
import type { ChatMessage, ChatRole } from "../types/index.ts";
import { isAskError } from "../types/index.ts";
import { askQuestion } from "../services/microsoftLearn.ts";
import Message from "./Message.tsx";
import QuestionInput from "./QuestionInput.tsx";
import LoadingState from "./LoadingState.tsx";

const EXAMPLE_QUESTIONS = [
  "How does Microsoft Fabric Direct Lake work?",
  "How do I create a Power BI deployment pipeline?",
  "What is Azure Data Factory?",
  "How do I authenticate with Microsoft Graph?",
  "What is the difference between a Fabric Warehouse and Lakehouse?",
  "How does Microsoft Entra service principal authentication work?",
];

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  function historyFor(msgs: ChatMessage[]): Array<{ role: ChatRole; content: string }> {
    return msgs.filter((m) => !m.error).map((m) => ({ role: m.role, content: m.content }));
  }

  async function handleSubmit(questionOverride?: string) {
    const question = (questionOverride ?? input).trim();
    if (!question || isLoading) return;

    const userMessage: ChatMessage = {
      id: makeId(),
      role: "user",
      content: question,
      createdAt: Date.now(),
    };

    const priorHistory = historyFor(messages);
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const result = await askQuestion(question, priorHistory, controller.signal);

      const assistantMessage: ChatMessage = isAskError(result)
        ? {
            id: makeId(),
            role: "assistant",
            content: result.message,
            error: result.error,
            createdAt: Date.now(),
          }
        : {
            id: makeId(),
            role: "assistant",
            content: result.answer,
            sources: result.sources,
            insufficientDocs: result.insufficientDocs,
            createdAt: Date.now(),
          };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          role: "assistant",
          content: "Microsoft Learn couldn't be reached right now. Please try again in a moment.",
          error: "network_error",
          createdAt: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleClear() {
    abortRef.current?.abort();
    setMessages([]);
    setInput("");
    setIsLoading(false);
  }

  const isEmpty = messages.length === 0;

  return (
    <>
      {isEmpty && (
        <section className="hero-band">
          <div className="hero-inner">
            <span className="hero-badge">Grounded in Microsoft Learn</span>
            <h1>Ask Microsoft. Get the documented answer.</h1>
            <p>
              Ask questions about Microsoft products, services, APIs, and technologies. Answers are
              grounded in Microsoft Learn documentation.
            </p>
            <div className="example-grid">
              {EXAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  className="example-card"
                  onClick={() => handleSubmit(q)}
                >
                  <span className="example-dot" aria-hidden="true" />
                  {q}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="chat-shell">
        {!isEmpty && (
          <div className="conversation" aria-live="polite">
            {messages.map((message) => (
              <Message key={message.id} message={message} />
            ))}
            {isLoading && <LoadingState />}
          </div>
        )}

        <div className="input-bar">
          <QuestionInput value={input} onChange={setInput} onSubmit={() => handleSubmit()} disabled={isLoading} />
          <div className="input-hint">
            {isEmpty ? (
              "Press Enter to ask, Shift+Enter for a new line."
            ) : (
              <button type="button" className="text-button" onClick={handleClear}>
                Clear conversation
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
