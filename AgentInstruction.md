# Microsoft Product Q&A React Web App – Agent Instructions

## 1. Role

You are an implementation agent responsible for building a **React web application** that answers user questions about Microsoft products and services.

The application is a focused Microsoft knowledge assistant, not a general-purpose chatbot.

Its primary job is:

> Accept a user's question → retrieve authoritative Microsoft documentation through the Microsoft Learn MCP → answer clearly with source links.

Do not add unnecessary product features, enterprise infrastructure, or a complex backend.

---

## 2. Core Product Scope

The app must answer questions related to Microsoft products, platforms, services, tools, APIs, certifications, and documentation.

Examples include:

- Microsoft Fabric
- Power BI
- Azure
- Microsoft 365
- Microsoft Entra
- Azure Data Factory
- Azure Synapse
- Azure SQL
- SQL Server
- Microsoft Purview
- Dataverse
- Dynamics 365
- Copilot
- Microsoft Graph
- .NET
- Power Platform
- Windows
- Visual Studio
- Microsoft certification and learning content
- Microsoft APIs, SDKs, services, and technical documentation

The application should **not** behave like a general web search engine.

If a question is unrelated to Microsoft products, politely state that the application is focused on Microsoft-related questions.

---

## 3. Microsoft Learn MCP

Use the Microsoft Learn MCP as the primary knowledge source.

MCP configuration:

```json
{
  "servers": {
    "microsoft-learn": {
      "type": "http",
      "url": "https://learn.microsoft.com/api/mcp"
    }
  }
}
```

### Source priority

For Microsoft-related questions:

1. Microsoft Learn MCP
2. Microsoft Learn documentation returned by the MCP
3. Only use general model knowledge when the Microsoft Learn MCP does not provide enough information, and clearly indicate when an answer is based on general knowledge rather than retrieved Microsoft documentation.

Do not invent Microsoft product behavior, configuration steps, limits, API parameters, pricing, feature availability, or certification requirements.

When documentation is unavailable or ambiguous, say so.

---

## 4. No Fancy Backend

Keep the architecture intentionally simple.

Do **not** introduce:

- A custom database
- User authentication
- User accounts
- Admin panels
- Microservices
- Redis
- PostgreSQL
- MongoDB
- Firebase
- Supabase
- Custom vector databases
- Custom RAG pipelines
- Background workers
- Kubernetes
- Complex API gateways
- Unnecessary server infrastructure

The application should be a lightweight React frontend with the smallest possible integration layer required to communicate with the Microsoft Learn MCP.

Do not build a backend merely for the sake of having a backend.

If the MCP can be accessed directly from the application environment safely, prefer that approach. If a server-side MCP proxy is technically required by the runtime or browser security model, create only a minimal proxy/API route.

---

## 5. Recommended Technology

Use:

- React
- TypeScript
- Vite
- Modern CSS or Tailwind CSS
- Microsoft Learn MCP
- Fetch/API primitives where appropriate

Keep dependencies minimal.

Do not introduce a UI framework unless it materially improves the implementation.

---

## 6. User Flow

The primary flow should be extremely simple:

```text
Open App
   ↓
Enter Microsoft-related question
   ↓
Submit
   ↓
Search Microsoft Learn through MCP
   ↓
Retrieve relevant documentation
   ↓
Generate concise answer
   ↓
Show answer + Microsoft Learn sources
```

Example:

```text
User:
"How do I create a shortcut in Microsoft Fabric?"

App:
1. Search Microsoft Learn MCP.
2. Retrieve relevant Fabric documentation.
3. Answer using the retrieved documentation.
4. Display the supporting Microsoft Learn links.
```

---

## 7. Chat Experience

The interface should feel like a modern documentation assistant rather than a generic AI chat application.

Include:

- Clean question input
- Search/Ask button
- Conversation history during the current session
- User messages
- Assistant responses
- Loading state
- Error state
- Source references
- Copy answer button
- Clear conversation button

Do not add unnecessary features such as:

- Social profiles
- Likes
- Comments
- Public conversations
- User accounts
- Gamification
- Complex dashboards

---

## 8. Homepage

The homepage should immediately explain the purpose of the application.

Suggested content:

### Main heading

**Ask Microsoft. Get the documented answer.**

### Supporting text

Ask questions about Microsoft products, services, APIs, and technologies. Answers are grounded in Microsoft Learn documentation.

### Example questions

- "How does Microsoft Fabric Direct Lake work?"
- "How do I create a Power BI deployment pipeline?"
- "What is Azure Data Factory?"
- "How do I authenticate with Microsoft Graph?"
- "What is the difference between a Fabric Warehouse and Lakehouse?"
- "How does Microsoft Entra service principal authentication work?"

The examples should be clickable and populate the question input.

---

## 9. Answer Requirements

Every answer should prioritize accuracy and usefulness.

The response should generally follow this structure:

```text
Direct answer

Short explanation

Steps / example / configuration
when applicable

Microsoft Learn sources
```

Do not produce unnecessarily long answers.

For procedural questions, prefer numbered steps.

For comparison questions, use a table when it improves clarity.

For code questions, provide concise working examples and explain only the important parts.

---

## 10. Grounding Rules

The assistant must distinguish between:

- Information explicitly supported by Microsoft Learn
- Reasonable interpretation of Microsoft documentation
- General knowledge

Never present unsupported information as documented fact.

If the retrieved Microsoft documentation does not answer the question:

```text
I couldn't find enough information in Microsoft Learn to answer this confidently.
```

Then explain what was found, if useful.

Do not fabricate a citation to make an answer look authoritative.

---

## 11. Source Display

Sources are a core part of the application.

For each answer, show the relevant Microsoft Learn documentation used to construct the response.

Each source should display:

- Page title
- Short description or relevance
- Microsoft Learn domain
- Clickable link

Prefer the most relevant sources rather than dumping every search result.

Example:

```text
Sources

Microsoft Learn
Microsoft Fabric documentation
https://learn.microsoft.com/...

Microsoft Learn
Direct Lake overview
https://learn.microsoft.com/...
```

Do not cite unrelated documentation.

---

## 12. Search Strategy

When a user asks a question:

### Step 1 – Identify the Microsoft product

Determine whether the question concerns:

- Fabric
- Power BI
- Azure
- Microsoft 365
- Entra
- SQL
- Power Platform
- Dynamics
- Windows
- Microsoft Graph
- .NET
- Another Microsoft technology

### Step 2 – Extract the intent

Identify whether the user wants:

- Explanation
- How-to instructions
- Troubleshooting
- Comparison
- Architecture guidance
- Code
- API usage
- Configuration
- Limits/quotas
- Pricing
- Certification information
- Product capability information

### Step 3 – Search Microsoft Learn MCP

Use the MCP to retrieve the most relevant official documentation.

### Step 4 – Synthesize

Answer the exact question using the retrieved documentation.

### Step 5 – Cite

Attach relevant Microsoft Learn sources to the answer.

---

## 13. Follow-up Questions

Maintain conversation context within the current browser session.

Example:

```text
User:
How does Direct Lake work?

Assistant:
...

User:
What are its limitations?

Assistant:
Use the previous context and search Microsoft Learn for the documented limitations.
```

Do not require the user to repeat the product name unnecessarily.

---

## 14. Troubleshooting Questions

For troubleshooting questions, structure the response as:

```text
Likely cause

How to verify

How to fix

If that doesn't work

Microsoft Learn sources
```

Do not claim a root cause unless the available documentation supports it.

If several causes are possible, rank them by likelihood and say that they are possibilities.

---

## 15. Code Questions

For Microsoft API, SDK, PowerShell, SQL, Python, JavaScript, C#, or configuration questions:

- Prefer Microsoft-documented syntax.
- Use current Microsoft Learn documentation.
- Keep examples minimal.
- Do not invent API parameters.
- Mention prerequisites when Microsoft documentation requires them.
- Clearly separate code from explanation.

If an API version or SDK version matters, verify it through Microsoft Learn before answering.

---

## 16. Current Information

Microsoft products change frequently.

For questions involving:

- Current features
- Preview features
- Product availability
- API versions
- Supported regions
- Limits
- Pricing
- Certification requirements
- Deprecations
- Product announcements

always prefer current Microsoft Learn information retrieved through the MCP.

Do not rely solely on model memory for these topics.

---

## 17. Error Handling

If the MCP request fails:

Show a useful error instead of silently generating an answer.

Example:

```text
Microsoft Learn couldn't be reached right now.

Please try again in a moment.
```

If the MCP returns no useful documentation:

```text
I couldn't find relevant Microsoft Learn documentation for this question.

Try asking with the Microsoft product name and the specific task or feature.
```

Do not fake an answer or fake sources.

---

## 18. UI Design

Design should be:

- Minimal
- Professional
- Fast
- Responsive
- Accessible
- Documentation-focused

Suggested visual direction:

- Microsoft-inspired but not a Microsoft clone
- Light and dark mode
- Clean typography
- Subtle borders
- Soft shadows
- Rounded cards
- Minimal animation
- Strong readability
- Mobile responsive

Avoid excessive glassmorphism, gradients, animations, 3D effects, or decorative elements.

The content and documentation should remain the visual priority.

---

## 19. Responsive Behavior

The application must work well on:

- Desktop
- Laptop
- Tablet
- Mobile

On mobile:

- Input should remain easy to use.
- Sources should be readable.
- Code blocks should scroll horizontally.
- Navigation should collapse cleanly.
- Conversation should not feel cramped.

---

## 20. Accessibility

Implement:

- Semantic HTML
- Keyboard navigation
- Visible focus states
- Proper labels
- Accessible buttons
- Sufficient contrast
- Screen-reader-friendly status messages
- Reduced-motion support where appropriate

Do not rely on color alone to communicate state.

---

## 21. Security

Never expose secrets in frontend code.

Do not hardcode:

- API keys
- Access tokens
- Credentials
- Private MCP credentials

The Microsoft Learn MCP endpoint shown above does not require inventing an API key.

If the runtime requires server-side handling, keep credentials and MCP communication server-side.

---

## 22. Performance

Keep the app lightweight.

Avoid:

- Large unnecessary libraries
- Huge client bundles
- Repeated MCP requests
- Duplicate searches
- Unnecessary state updates

Use:

- Request cancellation where appropriate
- Loading states
- Reasonable caching during the current session when safe
- Debouncing only where it materially helps

Do not cache information indefinitely when the answer may become outdated.

---

## 23. Project Structure

Use a simple structure similar to:

```text
src/
├── components/
│   ├── Chat.tsx
│   ├── Message.tsx
│   ├── SourceList.tsx
│   ├── QuestionInput.tsx
│   └── LoadingState.tsx
├── pages/
│   └── Home.tsx
├── services/
│   └── microsoftLearn.ts
├── types/
│   └── index.ts
├── App.tsx
├── main.tsx
└── styles/
    └── globals.css
```

If a backend/proxy is required:

```text
server/
└── microsoftLearnProxy.ts
```

Keep it minimal.

---

## 24. Configuration

Keep MCP configuration centralized.

Example:

```json
{
  "servers": {
    "microsoft-learn": {
      "type": "http",
      "url": "https://learn.microsoft.com/api/mcp"
    }
  }
}
```

Do not duplicate this configuration throughout the codebase.

---

## 25. Empty State

When there is no conversation, show:

```text
Ask anything about Microsoft

Get answers grounded in Microsoft Learn documentation.

Try:
• How does Microsoft Fabric Direct Lake work?
• How do I create a Power BI semantic model?
• How does Microsoft Entra authentication work?
```

---

## 26. Loading State

Use a simple status:

```text
Searching Microsoft Learn…
```

Then:

```text
Reading relevant documentation…
```

Then:

```text
Preparing your answer…
```

Do not use fake progress percentages.

---

## 27. Answer Quality Rules

The assistant should:

- Answer the question directly.
- Prefer official Microsoft documentation.
- Explain technical concepts in beginner-friendly language unless the user clearly asks for advanced detail.
- Preserve Microsoft product terminology.
- Mention important prerequisites.
- Avoid unsupported assumptions.
- Avoid hallucinated configuration steps.
- Cite sources close to the claims they support when practical.
- Say when documentation is insufficient.

The assistant should not:

- Pretend to have performed an action it did not perform.
- Invent Microsoft Learn URLs.
- Invent product features.
- Invent API behavior.
- Treat outdated knowledge as current.
- Answer unrelated questions as though they were Microsoft questions.

---

## 28. Example Interaction

### User

```text
What is a Microsoft Fabric Lakehouse?
```

### Assistant

```text
A Microsoft Fabric Lakehouse combines data lake storage with data warehousing capabilities in a single Fabric item.

It is designed to store structured and unstructured data and supports analytics through technologies such as Spark and SQL.

Sources:
- Microsoft Learn – Lakehouse overview
- Microsoft Learn – Microsoft Fabric documentation
```

The actual response must use the Microsoft Learn MCP to retrieve the current documentation and provide the actual source links.

---

## 29. Final Implementation Principle

Build the smallest application that does this exceptionally well:

```text
QUESTION
   ↓
MICROSOFT LEARN MCP
   ↓
RELEVANT DOCUMENTATION
   ↓
GROUNDED ANSWER
   ↓
OFFICIAL SOURCES
```

Do not turn this into a generic AI platform.

The product should feel like a **fast, focused Microsoft documentation assistant**.


## 31. Microsoft Docs Tool Usage

Use the Microsoft Learn MCP through these documentation capabilities:

| Tool | Use For |
|---|---|
| `microsoft_docs_search` | Find Microsoft documentation including concepts, guides, tutorials, configuration, limits, and best practices |
| `microsoft_docs_fetch` | Retrieve full Microsoft Learn page content when search excerpts are insufficient |

### When to Search

Use `microsoft_docs_search` for questions involving:

- Understanding Microsoft concepts
- Learning a Microsoft service
- Finding tutorials or quickstarts
- Configuration options
- Limits and quotas
- Best practices
- Troubleshooting documented behavior
- API or SDK documentation

Examples:

```text
"How does Cosmos DB partitioning work?"
"Azure Functions overview"
"App Service configuration settings"
"Azure OpenAI rate limits"
"Service Bus quotas"
"Azure security best practices"
```

### Search Query Quality

Do not use unnecessarily broad searches.

Bad:

```text
Azure Functions
```

Better:

```text
Azure Functions Python v2 programming model
```

Better:

```text
Cosmos DB partition key design best practices
```

Better:

```text
Container Apps scaling rules KEDA
```

Include relevant context in the search query whenever available:

- Product or service
- Version, such as `.NET 8` or `EF Core 8`
- Task intent, such as `quickstart`, `tutorial`, `overview`, or `limits`
- Platform, such as `Linux` or `Windows`

### When to Fetch the Full Page

After `microsoft_docs_search`, use `microsoft_docs_fetch` when:

- The user asks for a complete tutorial or step-by-step procedure.
- The user asks for comprehensive coverage of a topic.
- The search excerpt is truncated or missing important context.
- The question depends on detailed configuration options.
- Exact parameters, prerequisites, commands, or implementation details are required.
- The documentation contains a relevant section that needs to be inspected in full.

Do not fetch every result by default. Fetch only the most relevant pages needed to answer the question.

### Recommended Search → Fetch Flow

```text
User Question
      ↓
Identify Microsoft product + intent + context
      ↓
microsoft_docs_search
      ↓
Evaluate returned documentation
      ↓
Is the excerpt sufficient?
      ├── Yes → Answer using the retrieved content
      │
      └── No → microsoft_docs_fetch
                    ↓
              Read relevant page/section
                    ↓
                 Answer
      ↓
Show Microsoft Learn sources
```

### Documentation Grounding

Treat Microsoft Learn as the authoritative source for Microsoft product documentation.

Use retrieved documentation rather than relying on model memory for:

- Current product behavior
- Current feature availability
- Configuration
- API syntax
- SDK behavior
- Limits and quotas
- Deprecations
- Preview features
- Version-specific behavior
- Current certification or learning information

If Microsoft Learn does not provide enough evidence, explicitly say that the available documentation was insufficient.

Never manufacture documentation citations.

---

## 32. CLI Fallback

If the Microsoft Learn MCP tools are unavailable in the execution environment, the implementation may use the Microsoft Learn CLI as a fallback.

Search:

```sh
npx @microsoft/learn-cli search "azure functions timeout"
```

Or, after global installation:

```sh
npm install -g @microsoft/learn-cli
mslearn search "azure functions timeout"
```

Fetch:

```sh
mslearn fetch "https://learn.microsoft.com/..."
```

The CLI mapping is:

| MCP Tool | CLI Equivalent |
|---|---|
| `microsoft_docs_search(query: "...")` | `mslearn search "..."` |
| `microsoft_docs_fetch(url: "...")` | `mslearn fetch "..."` |

The fetch command may also support section-specific extraction and output truncation:

```sh
mslearn fetch "https://learn.microsoft.com/..." --section "Section Heading"
```

```sh
mslearn fetch "https://learn.microsoft.com/..." --max-chars 12000
```

### Fallback Priority

Use this order:

```text
1. Microsoft Learn MCP
2. Microsoft Learn CLI
3. General model knowledge only when documentation is unavailable
```

If the CLI is used, still show the Microsoft Learn source URL returned by the documentation lookup.

Do not silently substitute unrelated web search results for Microsoft Learn.

---

## 33. Documentation Search Examples

### Concept

User:

```text
How does Cosmos DB partitioning work?
```

Search:

```text
Cosmos DB partitioning overview partition key
```

### Version-specific development

User:

```text
How do I build Azure Functions with Python v2?
```

Search:

```text
Azure Functions Python v2 programming model
```

If implementation details are needed, fetch the relevant Microsoft Learn page.

### Tutorial

User:

```text
Show me how to create an Azure Function.
```

Search:

```text
Azure Functions quickstart create function
```

Then fetch the tutorial if the search result does not contain the complete required steps.

### Limits

User:

```text
What are Azure Service Bus quotas?
```

Search:

```text
Azure Service Bus quotas limits
```

Fetch the official limits page if exact values or multiple quota categories are required.

### Configuration

User:

```text
What App Service configuration settings are available?
```

Search:

```text
Azure App Service configuration settings
```

Fetch the relevant configuration documentation when the answer requires a complete list or detailed explanations.

---

## 34. Important Implementation Constraint

The application must not assume that tool names exposed by the MCP are interchangeable with arbitrary HTTP endpoints.

Implement the Microsoft Learn integration according to the MCP interface available to the runtime.

If the runtime exposes:

```text
microsoft_docs_search
microsoft_docs_fetch
```

use those tools directly.

If the runtime exposes the Microsoft Learn MCP through another compatible MCP interface, adapt to that interface rather than inventing unsupported tool calls.

The application must fail clearly when the documentation integration cannot be reached.

---

## 35. Final Source-of-Truth Rule

For Microsoft product questions:

```text
Microsoft Learn MCP
        ↓
Microsoft Learn documentation
        ↓
Grounded answer
        ↓
Microsoft Learn source links
```

The purpose of the app is not to produce plausible Microsoft answers.

The purpose is to produce **documented Microsoft answers**.


## 36. OpenRouter Free API

Use **OpenRouter** as the LLM provider for generating the final answer.

The application must support an OpenRouter free model/API configuration without requiring a paid OpenAI API key.

### Environment Variables

Use environment variables rather than hardcoding credentials:

```env
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=your_free_openrouter_model
```

Never commit the API key to source control.

Add the environment file to `.gitignore`:

```text
.env
.env.local
```

### OpenRouter Request

Use the OpenRouter API as the model-generation layer.

The application flow becomes:

```text
User Question
      ↓
Microsoft Learn MCP
      ↓
Relevant Documentation
      ↓
Documentation Context
      ↓
OpenRouter Free Model
      ↓
Grounded Answer
      ↓
Microsoft Learn Sources
```

OpenRouter is responsible for **answer generation**, not for replacing Microsoft Learn as the documentation source.

### Critical Grounding Rule

Do not send a Microsoft-related question directly to OpenRouter and allow the model to answer from its own knowledge.

Instead:

1. Search Microsoft Learn MCP first.
2. Retrieve relevant documentation.
3. Provide the retrieved documentation as context to the OpenRouter model.
4. Instruct the model to answer only from that context.
5. Include the relevant Microsoft Learn source links.

If the Microsoft Learn search returns insufficient information, the model must say that the documentation was insufficient rather than inventing an answer.

### OpenRouter System Instruction

Use a system instruction similar to:

```text
You are a Microsoft documentation assistant.

Answer questions about Microsoft products using ONLY the Microsoft Learn documentation supplied in the context.

Rules:
- Do not invent Microsoft features, APIs, configuration options, limits, commands, or product behavior.
- Prefer information explicitly supported by the supplied Microsoft Learn content.
- If the documentation does not contain enough information, say that the available Microsoft Learn documentation is insufficient.
- Do not fabricate citations or URLs.
- Keep answers concise and practical.
- For how-to questions, provide numbered steps.
- For comparison questions, use a table when useful.
- Preserve official Microsoft terminology.
```

### User Prompt Structure

Send the retrieved documentation to OpenRouter in a clearly separated structure:

```text
USER QUESTION
---
{user_question}

MICROSOFT LEARN DOCUMENTATION
---
{retrieved_documentation}

MICROSOFT LEARN SOURCES
---
{source_list}

INSTRUCTIONS
---
Answer the user's question using only the Microsoft Learn documentation above.
If the documentation is insufficient, explicitly say so.
```

### Model Configuration

Do not hardcode a model name that may become unavailable.

Make the model configurable through:

```env
OPENROUTER_MODEL=...
```

The UI or configuration layer may expose a default free model, but the application should allow the model identifier to be changed without modifying application code.

When selecting a free model, prefer a currently available OpenRouter model marked as free rather than assuming a particular model will remain free indefinitely.

### API Key Security

The OpenRouter API key must never be:

- Written directly into React source code.
- Stored in localStorage.
- Included in Git commits.
- Exposed in client-side JavaScript bundles.
- Displayed in the UI.
- Returned in API responses.

If the browser cannot safely call OpenRouter without exposing the key, create a **minimal server-side API route** that:

1. Receives the question/context from the React app.
2. Reads `OPENROUTER_API_KEY` from the server environment.
3. Calls OpenRouter.
4. Returns only the generated response and required metadata.

This is the only backend layer required for OpenRouter.

Do not create a database or authentication system.

### Recommended Architecture

```text
React + TypeScript
        │
        │ Question
        ▼
Minimal API Route
        │
        ├──────────────► Microsoft Learn MCP
        │                       │
        │                       ▼
        │                Documentation
        │
        └──────────────► OpenRouter
                                │
                                ▼
                         Grounded Answer
                                │
                                ▼
                         React Interface
```

If the runtime already provides secure MCP and OpenRouter access, avoid adding duplicate proxy layers.

### Failure Handling

If OpenRouter fails:

```text
I found the relevant Microsoft Learn documentation, but I couldn't generate the answer right now. Please try again.
```

If OpenRouter returns an empty response:

```text
I found relevant Microsoft Learn documentation, but I couldn't generate a reliable answer from it.
```

Never silently fall back to an unsupported answer.

### Cost Constraint

The project is intended to use OpenRouter's **free model options**.

Do not introduce paid model dependencies.

Keep the model configurable so the user can change the free model when OpenRouter changes its available free models.

---

## 37. Updated Technology Stack

Use this practical stack:

```text
Frontend:
- React
- TypeScript
- Vite
- Tailwind CSS or clean CSS

Documentation:
- Microsoft Learn MCP
- microsoft_docs_search
- microsoft_docs_fetch

LLM:
- OpenRouter
- Configurable free model

Backend:
- No database
- No authentication
- Minimal API route only when required to protect the OpenRouter API key
```

The application remains intentionally small.

Its job is:

```text
SEARCH OFFICIAL MICROSOFT DOCS
          +
GENERATE A CLEAR ANSWER
          =
MICROSOFT DOCUMENTATION ASSISTANT
```
