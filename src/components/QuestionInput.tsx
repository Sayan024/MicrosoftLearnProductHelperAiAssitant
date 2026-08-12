import { useEffect, useRef } from "react";

interface QuestionInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}

export default function QuestionInput({ value, onChange, onSubmit, disabled }: QuestionInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) onSubmit();
    }
  }

  return (
    <form
      className="input-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!disabled && value.trim()) onSubmit();
      }}
    >
      <label htmlFor="question-input" className="visually-hidden">
        Ask a Microsoft-related question
      </label>
      <textarea
        id="question-input"
        ref={textareaRef}
        className="question-textarea"
        placeholder="Ask about Azure, Microsoft 365, Fabric, .NET, and more…"
        rows={1}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button type="submit" className="send-button" disabled={disabled || !value.trim()}>
        Ask
      </button>
    </form>
  );
}
