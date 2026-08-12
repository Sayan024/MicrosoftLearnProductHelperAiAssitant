export interface Source {
  title: string;
  url: string;
  description?: string;
}

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  sources?: Source[];
  insufficientDocs?: boolean;
  error?: string;
  createdAt: number;
}

export interface AskRequest {
  question: string;
  history: Array<{ role: ChatRole; content: string }>;
}

export interface AskSuccessResponse {
  answer: string;
  sources: Source[];
  insufficientDocs: boolean;
}

export interface AskErrorResponse {
  error:
    | "mcp_unreachable"
    | "no_docs_found"
    | "generation_failed"
    | "empty_generation"
    | "off_topic"
    | "bad_request"
    | "rate_limited";
  message: string;
}

export type AskResponse = AskSuccessResponse | AskErrorResponse;

export function isAskError(res: AskResponse): res is AskErrorResponse {
  return "error" in res;
}
