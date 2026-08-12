const MS_KEYWORDS = [
  "microsoft",
  "azure",
  "fabric",
  "power bi",
  "power platform",
  "power apps",
  "power automate",
  "entra",
  "active directory",
  "office 365",
  "microsoft 365",
  "m365",
  "dynamics 365",
  "dynamics",
  "dataverse",
  "sql server",
  "azure sql",
  "synapse",
  "purview",
  "copilot",
  "graph api",
  "microsoft graph",
  ".net",
  "dotnet",
  "c#",
  "visual studio",
  "vs code",
  "windows",
  "sharepoint",
  "teams",
  "outlook",
  "exchange online",
  "intune",
  "defender",
  "sentinel",
  "azure devops",
  "github", // Microsoft-owned; commonly asked alongside Azure/DevOps workflows
  "power shell",
  "powershell",
  "hyper-v",
  "xbox",
  "surface",
  "bicep",
  "arm template",
  "cosmos db",
  "azure functions",
  "app service",
  "aks",
  "kubernetes service",
  "blob storage",
  "key vault",
  "service bus",
  "event hub",
  "logic apps",
  "azure ai",
  "azure openai",
  "certification",
  "az-",
  "ms-",
  "pl-",
  "sc-",
  "dp-",
  "ai-",
];

/**
 * Cheap keyword pre-filter so obviously unrelated questions are declined without
 * spending an MCP search + OpenRouter call. Follow-up questions are allowed through
 * whenever the conversation already has an assistant reply (so users don't have to
 * repeat the product name), per the app's follow-up requirement.
 */
export function isLikelyMicrosoftRelated(
  question: string,
  history: Array<{ role: "user" | "assistant"; content: string }>
): boolean {
  const q = question.toLowerCase();
  if (MS_KEYWORDS.some((kw) => q.includes(kw))) return true;
  return history.some((m) => m.role === "assistant");
}
