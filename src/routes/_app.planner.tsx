import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarClock, Sparkles, Loader2, Square, Brain, Coffee, Droplets, Activity, Leaf, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useGenerateStream } from "@/lib/use-stream";
import { ModuleHeader } from "@/components/module-header";

export const Route = createFileRoute("/_app/planner")({
  head: () => ({ meta: [{ title: "Task Planner & Wellbeing — NexusAI" }] }),
  component: PlannerPage,
});

const FRAMEWORKS = ["Stoic Reflection Prompts", "CBT Mind-De-Clutter Template", "High-Performance Intention Grid"];

type Block = { start: string; end: string; label: string; tag: string };

function parseBlocks(md: string): Block[] {
  const lines = md.split("\n");
  const out: Block[] = [];
  let inSection = false;
  for (const line of lines) {
    if (/^##\s+Time-Blocked Chronology/i.test(line)) { inSection = true; continue; }
    if (/^##\s+/.test(line)) { inSection = false; continue; }
    if (!inSection) continue;
    const m = line.match(/^-\s*(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})\s*\|\s*([^|]+?)\s*\|\s*(\w+)/);
    if (m) out.push({ start: m[1], end: m[2], label: m[3].trim(), tag: m[4].trim().toLowerCase() });
  }
  return out;
}

function extractJournal(md: string): string {
  const idx = md.search(/##\s+Health Tracker & Care Journal/i);
  if (idx === -1) return "";
  const rest = md.slice(idx);
  const code = rest.match(/```[\w]*\n([\s\S]*?)```/);
  if (code) return code[1].trim();
  // fallback: everything after the header
  return rest.split("\n").slice(1).join("\n").trim();
}

const tagStyles: Record<string, { ring: string; chip: string; icon: typeof Brain }> = {
  deep: { ring: "ring-indigo-200 dark:ring-indigo-900/60", chip: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300", icon: Brain },
  shallow: { ring: "ring-sky-200 dark:ring-sky-900/60", chip: "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300", icon: Activity },
  admin: { ring: "ring-slate-200 dark:ring-slate-800", chip: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300", icon: Activity },
  break: { ring: "ring-amber-200 dark:ring-amber-900/60", chip: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300", icon: Coffee },
  wellbeing: { ring: "ring-emerald-200 dark:ring-emerald-900/60", chip: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300", icon: Leaf },
};

function PlannerPage() {
  const [prompt, setPrompt] = useState("");
  const [framework, setFramework] = useState(FRAMEWORKS[2]);
  const [ergo, setErgo] = useState(true);
  const { text, isStreaming, error, run, stop } = useGenerateStream();

  const blocks = useMemo(() => parseBlocks(text), [text]);
  const journal = useMemo(() => extractJournal(text), [text]);

  const onGenerate = () => {
    if (!prompt.trim()) return toast.error("Describe your workload first.");
    run("planner", prompt, { framework, ergonomic: ergo });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <ModuleHeader icon={CalendarClock} title="Task Planner & Wellbeing Scheduler" desc="Energy-aware time blocks with ergonomic intermissions." />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card className="border-slate-200/80 p-5 dark:border-slate-800">
          <h2 className="text-sm font-semibold tracking-tight">Inputs</h2>
          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="workload">Workload / project milestones</Label>
              <Textarea id="workload" value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={10} placeholder="Dump everything on your plate today or this week…" />
            </div>
            <div>
              <Label>Journaling framework</Label>
              <Select value={framework} onValueChange={setFramework}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{FRAMEWORKS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <label className="flex items-start gap-2 rounded-lg border border-emerald-200/70 bg-emerald-50/50 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/20">
              <Checkbox checked={ergo} onCheckedChange={(v) => setErgo(Boolean(v))} className="mt-0.5" />
              <span className="text-sm">
                <span className="font-medium text-emerald-800 dark:text-emerald-200">Inject Ergonomic Intermissions</span>
                <span className="block text-xs text-emerald-700/80 dark:text-emerald-300/70">Hydration, posture resets, micro-walks, and grounding between heavy blocks.</span>
              </span>
            </label>
            <div className="flex gap-2">
              <Button onClick={onGenerate} disabled={isStreaming} className="bg-indigo-600 hover:bg-indigo-700">
                {isStreaming ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                {isStreaming ? "Planning…" : "Build my day"}
              </Button>
              {isStreaming && <Button variant="outline" onClick={stop}><Square className="mr-2 h-4 w-4" /> Stop</Button>}
            </div>
            {error && <p className="text-sm text-rose-600">{error}</p>}
          </div>
        </Card>

        <Card className="border-slate-200/80 p-5 dark:border-slate-800">
          <Tabs defaultValue="timeline">
            <TabsList>
              <TabsTrigger value="timeline">Time-Blocked Chronology</TabsTrigger>
              <TabsTrigger value="journal">Health & Care Journal</TabsTrigger>
            </TabsList>
            <TabsContent value="timeline" className="mt-4">
              {blocks.length === 0 ? (
                <p className="text-sm text-slate-400">{isStreaming ? "Building timeline…" : "Your timeline will appear here."}</p>
              ) : (
                <ol className="relative space-y-3 border-l border-slate-200 pl-5 dark:border-slate-800">
                  {blocks.map((b, i) => {
                    const s = tagStyles[b.tag] ?? tagStyles.admin;
                    const Icon = s.icon;
                    return (
                      <li key={i} className={`relative rounded-lg border bg-white p-3 ring-1 ${s.ring} dark:bg-slate-900`}>
                        <span className="absolute -left-[26px] top-3 flex h-4 w-4 items-center justify-center rounded-full bg-white ring-2 ring-indigo-400 dark:bg-slate-950" />
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-slate-500" />
                          <span className="font-mono text-xs text-slate-500">{b.start}–{b.end}</span>
                          <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${s.chip}`}>{b.tag}</span>
                        </div>
                        <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">{b.label}</p>
                        {b.tag === "wellbeing" && (
                          <div className="mt-1 flex gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                            <Droplets className="h-3 w-3" /> <Activity className="h-3 w-3" /> <Leaf className="h-3 w-3" />
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ol>
              )}
            </TabsContent>
            <TabsContent value="journal" className="mt-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">Framework: <span className="font-medium text-slate-700 dark:text-slate-300">{framework}</span></p>
                <Button size="sm" variant="ghost" disabled={!journal} onClick={() => { navigator.clipboard.writeText(journal); toast.success("Copied"); }}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
              <pre className="mt-3 max-h-[520px] overflow-auto rounded-lg bg-slate-900 p-4 font-mono text-xs leading-relaxed text-slate-100 dark:bg-slate-950">
                {journal || (isStreaming ? "Generating…" : "Your health tracker and journaling prompts will appear here.")}
              </pre>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
