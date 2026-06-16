
# NexusAI — AI Workplace Productivity Assistant

A premium SaaS workspace with 5 AI modules powered by Lovable AI (Gemini via the Lovable AI Gateway). Streaming outputs, polished slate/indigo design, fully responsive.

## Stack & Backend

- TanStack Start (existing template), Tailwind v4, shadcn/ui, Lucide icons.
- Lovable AI Gateway via `@ai-sdk/openai-compatible` + AI SDK (`streamText`, `useChat`).
- Server routes:
  - `src/routes/api/chat.ts` — streaming chat for Module E (`useChat`).
  - `src/routes/api/generate.ts` — streaming text endpoint for Modules A–D (different system prompts based on `mode` in body).
- Provider helper: `src/lib/ai-gateway.server.ts`.
- No database needed (no persistence requested). All state is in-memory per session.

## Design System

- Tokens added in `src/styles.css` under `@theme`:
  - Slate-based neutrals, indigo `--color-primary`, emerald `--color-success`, rose `--color-danger`, amber `--color-warning`.
  - Display font (e.g. Geist / Space Grotesk) + Inter body, loaded via `<link>` in `__root.tsx`.
  - Subtle gradients, soft shadows, 12px radius.
- Shadcn semantic tokens mapped in `@theme inline` (background/foreground/primary/etc.).
- Animations: fade-in, scale-in, shimmer for streaming, pulsing typing dots.

## Layout

- `src/routes/__root.tsx`: shellComponent + dismissible top "Responsible AI Disclaimer" banner (localStorage flag to remember dismissal during session).
- `src/routes/_app.tsx`: layout route with `SidebarProvider`, fixed vertical sidebar (desktop), header with `SidebarTrigger` + mobile hamburger.
- Sidebar nav items: Dashboard, Email Generator, Meeting Notes, Task Planner, Research, Chat.

## Routes / Modules

```
src/routes/
  __root.tsx              (shell + disclaimer banner)
  _app.tsx                (sidebar layout)
  _app.index.tsx          (Dashboard: module cards + quick stats)
  _app.email.tsx          (Module A)
  _app.notes.tsx          (Module B)
  _app.planner.tsx        (Module C)
  _app.research.tsx       (Module D)
  _app.chat.tsx           (Module E)
  api/chat.ts             (streaming chat endpoint)
  api/generate.ts         (streaming generation endpoint, mode-based)
```

### Module A — Smart Email Generator
- Textarea prompt, Tone dropdown (Formal/Executive, Friendly/Warm, Persuasive/Urgent), Language dropdown (EN/ES/FR/DE/JA).
- Streams a draft with `Subject:` line + body into an editable textarea. Copy-to-clipboard button (success toast).

### Module B — Meeting Notes Summarizer
- Large textarea for raw transcript.
- Server returns 3 sections (structured prompt → parsed by headings) rendered as 3 cards: Executive Summary, Action Items (with **OWNER:**), Key Decisions & Deadlines.
- Each card has copy button.

### Module C — Task Planner / Wellbeing Scheduler
- Inputs: chaotic workload textarea, Framework dropdown (Stoic Reflection, CBT Mind-De-Clutter, High-Performance Intention Grid), checkbox "Inject Ergonomic Intermissions".
- Two output panels (tabs):
  1. Time-Blocked Chronology — vertical timeline of blocks (icon + time + label + energy tag); intermission blocks render in emerald with hydration/posture/grounding icons when enabled.
  2. Health Tracker & Care Journal — markdown/code block with localized tracking + journaling prompts matching framework.

### Module D — Research Assistant
- Textarea + blueprint dropdown (Executive Whitepaper Dossier, Technical Feasibility Assessment, Competitive Intelligence Memorandum).
- Streams a long structured report with H1/H2 sections, metrics callouts, and a "Scholarly & Compliance References" section. Rendered with `react-markdown` + prose styling. Copy & download .md buttons.

### Module E — Chatbot
- Full-height chat using AI SDK `useChat` + `DefaultChatTransport` → `/api/chat`.
- System welcome message on mount.
- Quick-Prompt chips above composer ("Optimize this for an executive briefing", "Draft a standard action tracking framework", etc.) — click seeds and auto-sends.
- Typing indicator (3 pulsing dots) while `status === 'streaming'`.
- "Clear Conversation" button resets `messages` and id.
- Render `message.parts` with markdown for assistant.

## Streaming UX

- Modules A–D use a small client helper that POSTs to `/api/generate`, reads the response as a stream, and progressively appends chunks into the editable output area (textarea for A, parsed sections for B, timeline+markdown for C, markdown for D).
- A subtle shimmer/caret indicates active streaming; disable submit while streaming.

## Compliance Banner

- Fixed top banner: "Responsible AI: Verify outputs before use. NexusAI may produce inaccurate information." with dismiss (X). Dismissal stored in `sessionStorage`.

## Dependencies to add

- `ai`, `@ai-sdk/react`, `@ai-sdk/openai-compatible`, `react-markdown`, `remark-gfm`, `zod` (likely already present, will verify).

## Out of scope (not requested)

- Auth, database persistence, real calendar/email integrations, file uploads, multi-user state.

## Deliverable

A polished, fully interactive single-user productivity workspace with 5 working AI modules streaming real Lovable AI responses, responsive sidebar layout, compliance banner, and consistent slate/indigo design system.
