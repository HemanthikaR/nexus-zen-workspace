import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { createFileRoute } from "@tanstack/react-router";
import { streamText } from "ai";

type Mode = "email" | "notes" | "planner" | "research";

interface Body {
  mode: Mode;
  prompt: string;
  options?: Record<string, string | boolean>;
}

function buildPrompt({ mode, prompt, options = {} }: Body): { system: string; user: string } {
  switch (mode) {
    case "email": {
      const tone = options.tone ?? "Formal & Executive";
      const language = options.language ?? "English";
      return {
        system: `You are NexusAI's Smart Email Generator. Write polished, ready-to-send business emails.
Always output in this exact format:
Subject: <short, specific subject line>

<body paragraphs, professional, no placeholders unless absolutely necessary>

Sign off appropriately. Do not include any commentary, explanations, or markdown — only the raw email.`,
        user: `Write an email in ${language}.
Desired tone: ${tone}.
Context / topic:
${prompt}`,
      };
    }
    case "notes": {
      return {
        system: `You are NexusAI's Meeting Notes Summarizer. Convert raw meeting transcripts or messy notes into a structured briefing.
Respond with EXACTLY these three markdown sections in this order, using these exact H2 headers:

## Executive Summary
A 3-5 sentence structural synopsis of the conversation.

## Action Items & Accountabilities
- **OWNER: <Name>** — <action item>
(One bullet per item, always prefixed with **OWNER: <Name>** —)

## Key Decisions & Deadlines
- <decision or milestone with date / deadline>

Do not add any other sections, intro, or outro.`,
        user: `Raw meeting input:\n\n${prompt}`,
      };
    }
    case "planner": {
      const framework = options.framework ?? "High-Performance Intention Grid";
      const ergo = options.ergonomic ? "YES" : "NO";
      return {
        system: `You are NexusAI's Task Planner & Wellbeing Scheduler. You build energy-aware schedules that prevent burnout.
Respond with EXACTLY two markdown sections using these exact H2 headers:

## Time-Blocked Chronology
A chronological list of time blocks for a single workday. Each line must follow this format:
- HH:MM–HH:MM | <label> | <energy: deep|shallow|admin|break|wellbeing>
Order blocks by start time. Mix deep work with lighter blocks based on circadian energy.
${ergo === "YES" ? "Insert ergonomic intermissions (hydration, posture reset, mental grounding, micro-walk) between heavy work blocks, tagged as 'wellbeing' or 'break'." : "Do not insert wellbeing intermissions."}

## Health Tracker & Care Journal
A markdown code block (\`\`\`md ... \`\`\`) containing:
- Daily Health Tracker (hydration, posture, eye-strain, movement checkboxes)
- Boundary Reminders (3 concrete, kind boundaries)
- Journaling Prompts tailored to the "${framework}" framework (4 prompts)

Do not add anything else.`,
        user: `Chaotic workload / project milestones:\n\n${prompt}\n\nFramework: ${framework}\nInject ergonomic intermissions: ${ergo}`,
      };
    }
    case "research": {
      const blueprint = options.blueprint ?? "Executive Whitepaper Dossier";
      return {
        system: `You are NexusAI's Research Assistant. Produce a long-form, professionally formatted ${blueprint}.
Use rich markdown with:
# Title
## Executive Overview
## Key Findings (bulleted, include metric callouts like **+42%**)
## Analysis & Insights
## Strategic Recommendations
## Risks & Considerations
## Scholarly & Compliance References
(List 5-8 plausible references in academic format — note they are illustrative for validation, not real citations.)

Be substantive, structured, and analytical. Do not include commentary outside the report.`,
        user: `Research topic / data matrix:\n\n${prompt}\n\nBlueprint: ${blueprint}`,
      };
    }
  }
}

export const Route = createFileRoute("/api/generate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as Body;
        if (!body?.mode || !body?.prompt?.trim()) {
          return new Response("Missing mode or prompt", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const { system, user } = buildPrompt(body);
        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");
        const result = streamText({ model, system, prompt: user });
        return result.toTextStreamResponse();
      },
    },
  },
});
