import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FlaskConical, Sparkles, Loader2, Square, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useGenerateStream } from "@/lib/use-stream";
import { ModuleHeader } from "@/components/module-header";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const Route = createFileRoute("/_app/research")({
  head: () => ({ meta: [{ title: "Research Assistant — NexusAI" }] }),
  component: ResearchPage,
});

const BLUEPRINTS = [
  "Executive Whitepaper Dossier",
  "Technical Feasibility Assessment",
  "Competitive Intelligence Memorandum",
];

function ResearchPage() {
  const [prompt, setPrompt] = useState("");
  const [blueprint, setBlueprint] = useState(BLUEPRINTS[0]);
  const { text, isStreaming, error, run, stop } = useGenerateStream();

  const onGenerate = () => {
    if (!prompt.trim()) return toast.error("Provide a research topic.");
    run("research", prompt, { blueprint });
  };

  const onDownload = () => {
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "nexusai-report.md"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <ModuleHeader icon={FlaskConical} title="AI Research Assistant" desc="Structured dossiers with insights, metrics, and references." />
      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <Card className="border-slate-200/80 p-5 dark:border-slate-800">
          <h2 className="text-sm font-semibold tracking-tight">Brief</h2>
          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="topic">Research topic / data matrix</Label>
              <Textarea id="topic" value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={12} placeholder="e.g. Compare EU and US carbon disclosure frameworks for mid-cap manufacturers." />
            </div>
            <div>
              <Label>Blueprint template</Label>
              <Select value={blueprint} onValueChange={setBlueprint}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{BLUEPRINTS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={onGenerate} disabled={isStreaming} className="bg-indigo-600 hover:bg-indigo-700">
                {isStreaming ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                {isStreaming ? "Researching…" : "Generate report"}
              </Button>
              {isStreaming && <Button variant="outline" onClick={stop}><Square className="mr-2 h-4 w-4" /> Stop</Button>}
            </div>
            {error && <p className="text-sm text-rose-600">{error}</p>}
          </div>
        </Card>

        <Card className="border-slate-200/80 p-5 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight">Report</h2>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={!text} onClick={() => { navigator.clipboard.writeText(text); toast.success("Copied"); }}><Copy className="mr-2 h-3.5 w-3.5" /> Copy</Button>
              <Button size="sm" variant="outline" disabled={!text} onClick={onDownload}><Download className="mr-2 h-3.5 w-3.5" /> .md</Button>
            </div>
          </div>
          <div className="prose prose-sm dark:prose-invert mt-4 max-h-[70vh] max-w-none overflow-auto rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            {text ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown> : (
              <p className="text-sm text-slate-400">{isStreaming ? "Generating…" : "Your report will appear here, with metrics, insights, and a Scholarly & Compliance References section."}</p>
            )}
            {isStreaming && <span className="ml-1 inline-block h-3 w-1.5 animate-pulse bg-indigo-500" />}
          </div>
        </Card>
      </div>
    </div>
  );
}
