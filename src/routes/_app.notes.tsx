import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FileText, Copy, Sparkles, Square, Loader2, ListChecks, Flag, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useGenerateStream } from "@/lib/use-stream";
import { ModuleHeader } from "@/components/module-header";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const Route = createFileRoute("/_app/notes")({
  head: () => ({ meta: [{ title: "Meeting Notes Summarizer — NexusAI" }] }),
  component: NotesPage,
});

function splitSections(md: string) {
  const sections: Record<string, string> = { summary: "", actions: "", decisions: "" };
  const map: Record<string, keyof typeof sections> = {
    "executive summary": "summary",
    "action items & accountabilities": "actions",
    "key decisions & deadlines": "decisions",
  };
  let current: keyof typeof sections | null = null;
  for (const line of md.split("\n")) {
    const m = line.match(/^##\s+(.+?)\s*$/);
    if (m) {
      const key = m[1].trim().toLowerCase();
      current = map[key] ?? null;
      continue;
    }
    if (current) sections[current] += line + "\n";
  }
  return sections;
}

function NotesPage() {
  const [prompt, setPrompt] = useState("");
  const { text, isStreaming, error, run, stop } = useGenerateStream();

  const sections = useMemo(() => splitSections(text), [text]);

  const onGenerate = () => {
    if (!prompt.trim()) return toast.error("Paste your meeting notes first.");
    run("notes", prompt);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <ModuleHeader icon={FileText} title="Meeting Notes Summarizer" desc="From chaotic notes to a structured briefing." />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card className="border-slate-200/80 p-5 dark:border-slate-800">
          <h2 className="text-sm font-semibold tracking-tight">Raw input</h2>
          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="raw">Transcript or notes</Label>
              <Textarea id="raw" value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={18} placeholder="Paste raw meeting transcript or messy handwritten notes…" />
            </div>
            <div className="flex gap-2">
              <Button onClick={onGenerate} disabled={isStreaming} className="bg-indigo-600 hover:bg-indigo-700">
                {isStreaming ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                {isStreaming ? "Summarizing…" : "Summarize"}
              </Button>
              {isStreaming && <Button variant="outline" onClick={stop}><Square className="mr-2 h-4 w-4" /> Stop</Button>}
            </div>
            {error && <p className="text-sm text-rose-600">{error}</p>}
          </div>
        </Card>

        <div className="grid gap-4">
          <SectionCard icon={ClipboardList} title="Executive Summary" body={sections.summary} streaming={isStreaming} accent="indigo" />
          <SectionCard icon={ListChecks} title="Action Items & Accountabilities" body={sections.actions} streaming={isStreaming} accent="emerald" />
          <SectionCard icon={Flag} title="Key Decisions & Deadlines" body={sections.decisions} streaming={isStreaming} accent="amber" />
        </div>
      </div>
    </div>
  );
}

function SectionCard({ icon: Icon, title, body, streaming, accent }: { icon: typeof Flag; title: string; body: string; streaming: boolean; accent: "indigo" | "emerald" | "amber" }) {
  const accents = {
    indigo: "from-indigo-500 to-indigo-700",
    emerald: "from-emerald-500 to-teal-600",
    amber: "from-amber-500 to-rose-500",
  } as const;
  return (
    <Card className="border-slate-200/80 p-5 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br ${accents[accent]} text-white`}>
            <Icon className="h-3.5 w-3.5" />
          </div>
          <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        </div>
        <Button size="sm" variant="ghost" disabled={!body.trim()} onClick={() => { navigator.clipboard.writeText(body.trim()); toast.success("Copied"); }}>
          <Copy className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="prose prose-sm dark:prose-invert mt-3 max-w-none text-slate-700 dark:text-slate-300">
        {body.trim() ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown> : (
          <p className="text-sm text-slate-400">{streaming ? "Generating…" : "Awaiting input."}</p>
        )}
      </div>
    </Card>
  );
}
